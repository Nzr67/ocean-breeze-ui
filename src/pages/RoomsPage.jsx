import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingMsg, setBookingMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch {
      setBookingMsg({ type: 'error', text: 'Failed to load rooms.' });
    } finally {
      setLoading(false);
    }
  };

  const roomTypes = ['All', ...new Set(rooms.map((r) => r.room_type).filter(Boolean))];

  const filteredRooms =
    selectedType === 'All'
      ? rooms
      : rooms.filter((r) => r.room_type?.toLowerCase() === selectedType.toLowerCase());

  const openBookingModal = (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    setCheckIn('');
    setCheckOut('');
    setBookingMsg({ type: '', text: '' });
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingMsg({ type: '', text: '' });

    try {
      await api.post('/bookings', {
        room_id: selectedRoom.room_id,
        check_in: checkIn,
        check_out: checkOut,
      });
      setSelectedRoom(null);
      setBookingMsg({
        type: 'success',
        text: 'Booking confirmed! View your reservation under My Bookings.',
      });
    } catch (err) {
      setBookingMsg({
        type: 'error',
        text: err.response?.data?.message || 'Could not complete booking.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const amenities = [
    {
      title: 'Private Beach Access',
      desc: 'Direct pathway to golden southern beaches with reserved sun loungers and sunset views.',
    },
    {
      title: 'Coastal Dining & Catch',
      desc: 'Fresh Sri Lankan seafood, tropical fruit breakfasts, and private beachfront dining on request.',
    },
    {
      title: 'Infinity Plunge Pools',
      desc: 'Temperature-controlled oceanfront pools and open-air rain showers across select villas.',
    },
    {
      title: 'Instant Confirmation',
      desc: 'Real-time room availability with transparent LKR nightly rates and flexible date management.',
    },
    {
      title: 'Ayurvedic Spa & Wellness',
      desc: 'Traditional Ceylon herbal massages, ocean-breeze yoga decks, and holistic wellness treatments.',
    },
    {
      title: 'Island Excursions & Transfers',
      desc: 'Curated whale watching tours, Galle Fort heritage walks, and private airport pickups on demand.',
    },
  ];

  const today = new Date().toISOString().split('T')[0];
  const nights = calculateNights();

  return (
    <div style={styles.pageWrapper}>
      {/* Hero Banner */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.heroBadge}>SOUTHERN COAST · SRI LANKA</span>
          <h1 style={styles.heroTitle}>Sanctuary by the Indian Ocean</h1>
          <p style={styles.heroSubtitle}>
            Wake up to ocean breezes, private plunge pools, and handpicked beachfront suites
            designed for unhurried coastal stays
          </p>

          <div style={styles.heroActions}>
            <a href="#villas" style={styles.primaryHeroBtn}>
              Explore Villas
            </a>
            {!user ? (
              <button onClick={() => navigate('/login')} style={styles.secondaryHeroBtn}>
                Sign In to Book
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate(user.role?.toLowerCase() === 'admin' ? '/admin' : '/bookings')
                }
                style={styles.secondaryHeroBtn}
              >
                {user.role?.toLowerCase() === 'admin' ? 'Open Admin Console' : 'My Reservations'}
              </button>
            )}
          </div>

          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <strong style={styles.statValue}>{rooms.length || 4}</strong>
              <span style={styles.statLabel}>Coastal Suites & Villas</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <strong style={styles.statValue}>4.9 ★</strong>
              <span style={styles.statLabel}>Guest Satisfaction</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <strong style={styles.statValue}>24 / 7</strong>
              <span style={styles.statLabel}>Concierge & Beach Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="villas" style={styles.container}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>OceanBreeze Coastal Villas</h2>
            <p style={styles.sectionSubtitle}>
              Handpicked beachfront suites & private villas along the southern coast
            </p>
          </div>

          {/* Room Type Filter Pills */}
          {!loading && roomTypes.length > 1 && (
            <div style={styles.filterGroup}>
              {roomTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={
                    selectedType === type ? styles.filterBtnActive : styles.filterBtn
                  }
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {bookingMsg.text && !selectedRoom && (
          <div
            style={
              bookingMsg.type === 'success' ? styles.alertSuccess : styles.alertError
            }
          >
            {bookingMsg.text}
          </div>
        )}

        {loading ? (
          <p style={styles.loadingText}>Loading coastal villas...</p>
        ) : filteredRooms.length === 0 ? (
          <div style={styles.emptyBox}>
            No villas available under <strong>{selectedType}</strong>.
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredRooms.map((room) => (
              <div key={room.room_id} style={styles.card}>
                <div style={styles.cardTopRow}>
                  <span style={styles.typeBadge}>{room.room_type}</span>
                  <span
                    style={
                      room.room_status ? styles.statusAvailable : styles.statusUnavailable
                    }
                  >
                    ● {room.room_status ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <h3 style={styles.roomName}>{room.room_name}</h3>
                <p style={styles.description}>{room.description}</p>

                <div style={styles.metaRow}>
                  <span>Up to {room.max_guests} Guests</span>
                  <span>•</span>
                  <span>Free Wi-Fi & Breakfast</span>
                </div>

                <div style={styles.cardFooter}>
                  <div>
                    <span style={styles.price}>
                      LKR {Number(room.price_per_night).toLocaleString()}
                    </span>
                    <span style={styles.perNight}> / night</span>
                  </div>
                  <button
                    onClick={() => openBookingModal(room)}
                    disabled={!room.room_status}
                    style={room.room_status ? styles.bookBtn : styles.disabledBtn}
                  >
                    {room.room_status ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resort Amenities Strip */}
        <section style={styles.amenitiesSection}>
          <div style={styles.amenitiesHeader}>
            <span style={styles.amenitiesKicker}>INCLUDED WITH EVERY STAY</span>
            <h2 style={styles.amenitiesTitle}>Designed for Effortless Coastal Living</h2>
          </div>
          <div style={styles.amenitiesGrid}>
            {amenities.map((item) => (
              <div key={item.title} style={styles.amenityCard}>
                <div style={styles.amenityDot} />
                <h4 style={styles.amenityTitle}>{item.title}</h4>
                <p style={styles.amenityDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <strong style={styles.footerBrand}>OceanBreeze Coastal Villas</strong>
            <p style={styles.footerText}>
              67, Galle Road, Southern Coast, Sri Lanka · Reservations & Guest Concierge | 0703933440
            </p>
          </div>
          <p style={styles.footerCopy}>
            © {new Date().getFullYear()} OceanBreeze Resort. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Booking Modal */}
      {selectedRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>
              Book {selectedRoom.room_name}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Rate: <strong>LKR {Number(selectedRoom.price_per_night).toLocaleString()}</strong> /
              night (Max {selectedRoom.max_guests} guests)
            </p>

            {bookingMsg.text && (
              <div style={styles.alertError}>{bookingMsg.text}</div>
            )}

            <form onSubmit={handleBookSubmit} style={styles.form}>
              <label style={styles.label}>
                Check-in Date
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Check-out Date
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>

              {nights > 0 && (
                <div style={styles.summaryBox}>
                  <span>
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <strong>
                    Total: LKR {(nights * selectedRoom.price_per_night).toLocaleString()}
                  </strong>
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || nights <= 0}
                  style={styles.bookBtn}
                >
                  {submitting ? 'Confirming...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    background: 'linear-gradient(135deg, #003b7a 0%, #0056b3 55%, #0284c7 100%)',
    color: '#ffffff',
    padding: '3.75rem 1.5rem 3.25rem',
  },
  heroInner: {
    maxWidth: '1150px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    padding: '0.3rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    lineHeight: 1.15,
    margin: '0 0 0.85rem',
    maxWidth: '680px',
    fontWeight: '800',
    
  },
  heroSubtitle: {
    fontSize: '1.08rem',
    lineHeight: 1.6,
    color: '#e0f2fe',
    maxWidth: '620px',
    margin: '0 0 1.75rem',
  },
  heroActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.85rem',
    marginBottom: '2.5rem',
  },
  primaryHeroBtn: {
    backgroundColor: '#ffffff',
    color: '#004494',
    padding: '0.7rem 1.4rem',
    borderRadius: '8px',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  secondaryHeroBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.45)',
    padding: '0.7rem 1.4rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  statsBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1.75rem',
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    maxWidth: '720px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '0.82rem',
    color: '#bae6fd',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  container: {
    maxWidth: '1150px',
    width: '100%',
    margin: '0 auto',
    padding: '2.75rem 1.5rem',
    flex: 1,
    boxSizing: 'border-box',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.75rem',
  },
  sectionTitle: {
    color: '#004494',
    fontSize: '1.75rem',
    margin: '0 0 0.25rem',
  },
  sectionSubtitle: {
    color: '#64748b',
    margin: 0,
    fontSize: '0.96rem',
  },
  filterGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  filterBtn: {
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '0.45rem 0.95rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#0056b3',
    color: '#ffffff',
    border: '1px solid #0056b3',
    padding: '0.45rem 0.95rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
  },
  typeBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '0.28rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusAvailable: {
    color: '#16a34a',
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  statusUnavailable: {
    color: '#dc2626',
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  roomName: {
    margin: '0 0 0.5rem',
    color: '#0f172a',
    fontSize: '1.25rem',
  },
  description: {
    color: '#475569',
    fontSize: '0.93rem',
    lineHeight: 1.55,
    flex: 1,
    margin: '0 0 1rem',
  },
  metaRow: {
    display: 'flex',
    gap: '0.6rem',
    fontSize: '0.83rem',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '0.55rem 0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '1rem',
  },
  price: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  perNight: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  bookBtn: {
    backgroundColor: '#0056b3',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  disabledBtn: {
    backgroundColor: '#cbd5e1',
    color: '#64748b',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontWeight: '600',
  },
  amenitiesSection: {
    marginTop: '3.75rem',
    paddingTop: '2.75rem',
    borderTop: '1px solid #e2e8f0',
  },
  amenitiesHeader: {
    marginBottom: '1.5rem',
  },
  amenitiesKicker: {
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: '#0284c7',
  },
  amenitiesTitle: {
    fontSize: '1.5rem',
    color: '#0f172a',
    margin: '0.25rem 0 0',
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  amenityCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  amenityDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    backgroundColor: '#0056b3',
    marginBottom: '0.75rem',
  },
  amenityTitle: {
    margin: '0 0 0.4rem',
    color: '#0f172a',
    fontSize: '1.02rem',
  },
  amenityDesc: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.88rem',
    lineHeight: 1.55,
  },
  footer: {
    backgroundColor: '#111f3f',
    color: '#cbd5e1',
    padding: '2rem 1.5rem',
    marginTop: '2rem',
  },
  footerInner: {
    maxWidth: '1150px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerBrand: {
    color: '#ffffff',
    fontSize: '1.05rem',
  },
  footerText: {
    margin: '0.25rem 0 0',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  footerCopy: {
    margin: 0,
    fontSize: '0.83rem',
    color: '#94a3b8',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '1rem',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    color: '#475569',
    textAlign: 'center',
  },
  alertSuccess: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontWeight: '600',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.25rem',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    backgroundColor: '#ffffff',
    padding: '1.75rem',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 35px rgba(15, 23, 42, 0.25)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.9rem',
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  summaryBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#0369a1',
    fontSize: '0.95rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: 'none',
    padding: '0.6rem 1.1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};