function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatChatMessageAt(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = pad(hours % 12);

  return `${year}.${month}.${day}. ${period} ${displayHour}:${minutes}`;
}
