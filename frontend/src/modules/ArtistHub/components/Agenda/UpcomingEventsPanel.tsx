import React from 'react';
import './UpcomingEventsPanel.css';

interface Event {
    id: string;
    title: string;
    start_time: string;
    type: string;
    metadata?: any;
}

interface UpcomingEventsPanelProps {
    events: Event[];
    onEventClick: (event: Event) => void;
}

export const UpcomingEventsPanel: React.FC<UpcomingEventsPanelProps> = ({ events, onEventClick }) => {
    if (events.length === 0) return null;

    return (
        <div className="upcoming-panel">
            <div className="panel-header">
                <h3>Próximos Destaques</h3>
            </div>
            <div className="cards-container">
                {events.slice(0, 4).map(event => { // Limit to 4 cards for layout balance
                    const date = new Date(event.start_time);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={event.id}
                            className={`upcoming-card type-${event.type}`}
                            onClick={() => onEventClick(event)}
                        >
                            <div className="card-indicator"></div>
                            <div className="card-content">
                                <span className="card-date">
                                    {isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    {' • '}
                                    {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="card-title" title={event.title}>{event.title}</span>
                                <span className="card-type-label">{translateType(event.type)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const translateType = (type: string) => {
    const map: Record<string, string> = {
        release: 'Lançamento',
        show: 'Show',
        recording: 'Gravação',
        content: 'Conteúdo',
        meeting: 'Reunião',
        deadline: 'Deadline',
        other: 'Outro'
    };
    return map[type] || type;
};
