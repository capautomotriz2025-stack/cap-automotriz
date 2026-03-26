import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import Candidate from '@/models/Candidate';

const SLA_DAYS = 28;

export async function GET() {
  try {
    await dbConnect();

    // Todas las vacantes cerradas (status closed) o con candidato contratado
    const vacancies = await Vacancy.find({}).lean();
    const vacancyIds = vacancies.map((v: any) => v._id.toString());

    // Candidatos contratados
    const hiredCandidates = await Candidate.find({ status: 'hired' }).lean();

    // Mapa: vacancyId -> primera contratación
    const hiredMap: Record<string, Date> = {};
    for (const c of hiredCandidates as any[]) {
      const vid = c.vacancyId?.toString();
      if (!vid) continue;
      const hiredDate = c.hiredAt || c.updatedAt;
      if (!hiredMap[vid] || hiredDate < hiredMap[vid]) {
        hiredMap[vid] = hiredDate;
      }
    }

    const detail: Array<{
      vacancyId: string;
      title: string;
      department: string;
      createdAt: string;
      hiredAt: string;
      days: number;
      onTime: boolean;
    }> = [];

    let onTime = 0;
    let overTime = 0;

    for (const v of vacancies as any[]) {
      const vid = v._id.toString();
      const hiredDate = hiredMap[vid];
      if (!hiredDate) continue;

      const createdAt = new Date(v.createdAt);
      const days = Math.floor((new Date(hiredDate).getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const inTime = days <= SLA_DAYS;

      if (inTime) onTime++;
      else overTime++;

      detail.push({
        vacancyId: vid,
        title: v.title || 'Sin título',
        department: v.department || '',
        createdAt: createdAt.toISOString(),
        hiredAt: new Date(hiredDate).toISOString(),
        days,
        onTime: inTime,
      });
    }

    detail.sort((a, b) => a.days - b.days);

    return NextResponse.json({
      success: true,
      data: {
        onTime,
        overTime,
        total: onTime + overTime,
        slaDays: SLA_DAYS,
        detail,
      },
    });
  } catch (error) {
    console.error('Error vacancy-time-stats:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
