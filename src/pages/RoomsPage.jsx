import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch(() => setFeedback({ type: 'error', text: 'Failed to load rooms from API.' }))
      .finally(() => setLoading(false));
  }, []);

  // Calculate nights and preview price
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const estimatedTotal = selectedRoom ? nights * Number(selectedRoom.price_per_night) : 0;

  const handleOpenBooking = (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setCheckIn('');
    setCheckOut('');
    setFeedback({ type: '', text: '' });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      await api.post('/bookings', {
        room_id: selectedRoom.room_id,
        check_in: checkIn,
        check_out: checkOut,
      });
      setFeedback({ type: 'success', text: 'Booking confirmed! View it under My Bookings.' });
      setSelectedRoom(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not complete booking.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="status-msg">Loading coastal villas...</p>;

  return (
    <div className="container">
      <header className="hero">
        <h1>OceanBreeze Coastal Villas</h1>
        <p>Handpicked beachfront suites & private villas along the southern coast.</p>
      </header>

      {feedback.text && (
        <div className={`alert ${feedback.type}`}>{feedback.text}</div>
      )}

      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room.room_id} className="room-card">
            <div className="room-badge">{room.room_type}</div>
            <h2>{room.room_name}</h2>
            <p className="room-desc">{room.description}</p>
            <div className="room-meta">
              <span>Max Guests: <strong>{room.max_guests}</strong></span>
              <span>
                Status:{' '}
                <strong className={room.room_status ? 'text-green' : 'text-red'}>
                  {room.room_status ? 'Available' : 'Unavailable'}
                </strong>
              </span>
            </div>
            <div className="room-footer">
              <div className="price">
                LKR {Number(room.price_per_night).toLocaleString()} <span>/ night</span>
              </div>
              <button
                className="btn-primary"
                disabled={!room.room_status}
                onClick={() => handleOpenBooking(room)}
              >
                {room.room_status ? 'Book Now' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Reserve {selectedRoom.room_name}</h2>
            <p className="muted">
              LKR {Number(selectedRoom.price_per_night).toLocaleString()} per night · Max {selectedRoom.max_guests} guests
            </p>

            <form onSubmit={handleBookingSubmit}>
              <label>
                Check-in Date
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </label>

              <label>
                Check-out Date
                <input
                  type="date"
                  required
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </label>

              {nights > 0 && (
                <div className="price-summary">
                  <span>{nights} night{nights > 1 ? 's' : ''}</span>
                  <strong>Total: LKR {estimatedTotal.toLocaleString()}</strong>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedRoom(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting || nights <= 0}>
                  {submitting ? 'Booking...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}