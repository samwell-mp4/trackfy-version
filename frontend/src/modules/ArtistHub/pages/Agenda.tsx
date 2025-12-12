import React, { useState, useEffect } from 'react';
import { artistHubService } from '../../../services/artistHubService';
import { Button } from '@components/common/Button';
import { CreateEventModal } from '../components/CreateEventModal';
import './Agenda.css';

interface Event {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    type: string;
}

export const Agenda: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'month' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadEvents();
    }, [currentDate]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            // Calculate start and end of month
            const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
            const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

            const data = await artistHubService.getEvents(start, end);
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const renderCalendar = () => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.start_time.startsWith(dateStr));

            days.push(
                <div key={day} className="calendar-day">
                    <span className="day-number">{day}</span>
                    <div className="day-events">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`event-pill type-${event.type}`}>
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return <div className="calendar-grid">{days}</div>;
    };

    return (
        <div className="agenda-page">
            <div className="page-header">
                <div className="header-left">
                    <h1>📅 Agenda</h1>
                    <div className="date-controls">
                        <button onClick={prevMonth}>&lt;</button>
                        <span>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={nextMonth}>&gt;</button>
                    </div>
                </div>
                <div className="header-actions">
                    <Button variant={view === 'month' ? 'primary' : 'outline'} onClick={() => setView('month')}>Mês</Button>
                    <Button variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}>Lista</Button>
                    <Button onClick={() => setIsModalOpen(true)}>+ Novo Evento</Button>
                </div>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <div className="agenda-content">
                    {view === 'month' ? (
                        <>
                            <div className="weekdays-header">
                                <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                            </div>
                            {renderCalendar()}
                        </>
                    ) : (
                        <div className="events-list">
                            {events.map(event => (
                                <div key={event.id} className="event-item">
                                    <div className="event-date">
                                        {new Date(event.start_time).toLocaleDateString()}
                                    </div>
                                    <div className="event-details">
                                        <h3>{event.title}</h3>
                                        <span>{event.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadEvents}
            />
        </div>
    );
};
