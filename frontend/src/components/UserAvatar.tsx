import { User } from '../types/models';

export default function UserAvatar({
  user,
  size = 32,
}: {
  user: User;
  size?: number;
}) {
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: Math.max(12, Math.floor(size / 3)),
    color: '#111827',
  };
  return (
    <div style={style} aria-label={user.name} title={user.name}>
      {initials}
    </div>
  );
}
