import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchBookings = () => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch(() => setMessage('Failed to load your bookings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.put(`/bookings/${bookingId}`, { booking_status: 'Cancelled' });
      setMessage('Reservation cancelled.');
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to cancel booking.');
    }
  };

  if (loading) return <p className="status-msg">Loading your bookings...</p>;

  return (
    <div className="container">
      <h1>My Reservations</h1>
      {message && <div className="alert success">{message}</div>}

      {bookings.length === 0 ? (
        <p className="muted">You have not made any reservations yet.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Villa / Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id}>
                  <td>#{b.booking_id}</td>
                  <td><strong>{b.room?.room_name || `Room #${b.room_id}`}</strong></td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>{Number(b.total_amount).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${b.booking_status.toLowerCase()}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td>
                    {b.booking_status !== 'Cancelled' && (
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleCancel(b.booking_id)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}