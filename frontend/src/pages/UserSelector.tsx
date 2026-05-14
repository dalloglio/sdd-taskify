import UserAvatar from '../components/UserAvatar';
import { useUserStore } from '../context/userStore';
import { useGetUsers } from '../hooks/useUsers';

export default function UserSelector() {
  const { data: users, isLoading } = useGetUsers();
  const { currentUser, setCurrentUser } = useUserStore();

  if (isLoading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Select User</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {users?.map((u) => (
          <button
            key={u.id}
            onClick={() => setCurrentUser(u)}
            className={`flex items-center gap-3 p-3 border rounded ${
              currentUser?.id === u.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <UserAvatar user={u} size={40} />
            <div className="text-left">
              <div className="font-medium">{u.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
