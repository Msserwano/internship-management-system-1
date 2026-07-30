import { useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { useNotifications } from '../../context/NotificationsContext';
import { fRelative } from '../../utils/formatters';

const HRNotifications = () => {
  const { notifications, loading, fetchNotifications, markRead } = useNotifications();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="page-container">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="card p-4 mt-4">
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && notifications.length === 0 && <p className="text-sm text-slate-500">No notifications.</p>}
        <div className="divide-y divide-slate-100">
          {notifications.map(n => (
            <div key={n.id} className={`p-3 ${!n.isRead ? 'bg-primary-50/30' : ''}`}> 
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{n.type.replace(/_/g,' ')}</p>
                  <p className="text-sm text-slate-600 mt-1">{n.payload?.applicationId ? `Application ${n.payload.applicationId}` : (n.payload?.message || '')}</p>
                  <p className="text-xs text-slate-400 mt-1">{fRelative(n.createdAt)}</p>
                </div>
                {!n.isRead && <button className="text-xs text-primary-600" onClick={() => markRead(n.id)}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRNotifications;
