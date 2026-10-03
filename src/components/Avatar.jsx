import { initials } from '../utils';

export default function Avatar({ name, size = 34 }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}
