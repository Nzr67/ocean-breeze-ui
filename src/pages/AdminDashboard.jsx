import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyRoomForm = {
  room_name: '',
  room_type: '',
  description: '',
  price_per_night: '',
  max_guests: 2,
  room_status: true,
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms'),
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
    } catch {
      setFeedback({ type: 'error', text: 'Failed to load admin data.' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Booking Status Actions ---
  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}`, { booking_status: status });
      setFeedback({ type: 'success', text: `Booking #${bookingId} marked as ${status}.` });
      loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to update booking status.' });
    }
  };

  // --- Room CRUD Actions ---
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    try {
      if (editingRoomId) {
        await api.put(`/rooms/${editingRoomId}`, roomForm);
        setFeedback({ type: 'success', text: 'Room updated successfully.' });
      } else {
        await api.post('/rooms', roomForm);
        setFeedback({ type: 'success', text: 'New room added successfully.' });
      }
      setRoomForm(emptyRoomForm);
      setEditingRoomId(null);
      loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Could not save room.',
      });
    }
  };

  const startEditRoom = (room) => {
    setEditingRoomId(room.room_id);
    setRoomForm({
      room_name: room.room_name,
      room_type: room.room_type,
      description: room.description,
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      room_status: Boolean(room.room_status),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room permanently?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setFeedback({ type: 'success', text: 'Room deleted.' });
      loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to delete room.' });
    }
  };

  return (
    <div className="container">
      <div className="admin-header">
        <h1>Admin Management Console</h1>
        <div className="tab-group">
          <button
            className={tab === 'bookings' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('bookings')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={tab === 'rooms' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setTab('rooms')}
          >
            Manage Rooms ({rooms.length})
          </button>
        </div>
      </div>

      {feedback.text && <div className={`alert ${feedback.type}`}>{feedback.text}</div>}

      {tab === 'bookings' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Dates</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id}>
                  <td>#{b.booking_id}</td>
                  <td>
                    <strong>{b.user?.name}</strong>
                    <div className="muted-sm">{b.user?.contact_number || b.user?.email}</div>
                  </td>
                  <td>{b.room?.room_name}</td>
                  <td>{b.check_in} → {b.check_out}</td>
                  <td>{Number(b.total_amount).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${b.booking_status.toLowerCase()}`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="action-cell">
                    {b.booking_status !== 'Confirmed' && (
                      <button
                        className="btn-success-sm"
                        onClick={() => updateBookingStatus(b.booking_id, 'Confirmed')}
                      >
                        Approve
                      </button>
                    )}
                    {b.booking_status !== 'Cancelled' && (
                      <button
                        className="btn-danger-sm"
                        onClick={() => updateBookingStatus(b.booking_id, 'Cancelled')}
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
      ) : (
        <div>
          {/* Add / Edit Room Form */}
          <div className="card-box">
            <h2>{editingRoomId ? `Edit Room #${editingRoomId}` : 'Add New Villa / Room'}</h2>
            <form onSubmit={handleRoomSubmit} className="room-form-grid">
              <label>
                Room Name
                <input
                  required
                  value={roomForm.room_name}
                  onChange={(e) => setRoomForm({ ...roomForm, room_name: e.target.value })}
                />
              </label>

              <label>
                Room Type
                <input
                  required
                  placeholder="e.g., Luxury Villa, Deluxe Suite"
                  value={roomForm.room_type}
                  onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                />
              </label>

              <label>
                Price Per Night (LKR)
                <input
                  type="number"
                  step="0.01"
                  required
                  value={roomForm.price_per_night}
                  onChange={(e) => setRoomForm({ ...roomForm, price_per_night: e.target.value })}
                />
              </label>

              <label>
                Max Guests
                <input
                  type="number"
                  min="1"
                  required
                  value={roomForm.max_guests}
                  onChange={(e) => setRoomForm({ ...roomForm, max_guests: Number(e.target.value) })}
                />
              </label>

              <label className="full-span">
                Description
                <textarea
                  rows="2"
                  required
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={roomForm.room_status}
                  onChange={(e) => setRoomForm({ ...roomForm, room_status: e.target.checked })}
                />
                Available for booking
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn-primary">
                  {editingRoomId ? 'Update Room' : 'Create Room'}
                </button>
                {editingRoomId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setEditingRoomId(null);
                      setRoomForm(emptyRoomForm);
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing Rooms Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price / Night</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.room_id}>
                    <td>#{r.room_id}</td>
                    <td><strong>{r.room_name}</strong></td>
                    <td>{r.room_type}</td>
                    <td>LKR {Number(r.price_per_night).toLocaleString()}</td>
                    <td>{r.max_guests}</td>
                    <td>{r.room_status ? 'Available' : 'Unavailable'}</td>
                    <td className="action-cell">
                      <button className="btn-secondary-sm" onClick={() => startEditRoom(r)}>
                        Edit
                      </button>
                      <button className="btn-danger-sm" onClick={() => deleteRoom(r.room_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}