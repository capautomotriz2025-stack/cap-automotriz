import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'published': 'bg-green-100 text-green-800',
    'closed': 'bg-red-100 text-red-800',
    'applied': 'bg-blue-100 text-blue-800',
    'screening': 'bg-yellow-100 text-yellow-800',
    'interview': 'bg-purple-100 text-purple-800',
    'evaluation': 'bg-indigo-100 text-indigo-800',
    'offer': 'bg-emerald-100 text-emerald-800',
    'hired': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    'ideal': 'bg-green-500',
    'potencial': 'bg-yellow-500',
    'no perfila': 'bg-red-500',
  };
  return colors[classification] || 'bg-gray-500';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

