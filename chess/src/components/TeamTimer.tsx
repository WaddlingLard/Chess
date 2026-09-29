import { useState, useRef, useEffect } from 'react';
import { TeamType } from './ChessPiece';
import { useGame } from '../contexts/GameContext';
import { capitalizeString } from '../utils/utils';

type TimerState = "PAUSED" | "ACTIVE" | "COMPLETE";

const BorderColorState: Record<TimerState, any> = {
    'PAUSED': '#a3a3a3',
    'ACTIVE': '#3F3',
    'COMPLETE': '#F33'
}

export function TeamTimer({teamType, seconds}: {teamType: TeamType, seconds: number}) {

    const { teamTurn } = useGame();

    const [timerState, setTimerState] = useState<TimerState>('PAUSED');
    // Multiplied by a factor of 1000 for more granularity
    const [time, setTime] = useState<number>(seconds * 1000);
    const timeRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType <typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerState === 'COMPLETE') return;
        if (teamTurn === teamType) {
            setTimerState('ACTIVE');
        } else {
            setTimerState('PAUSED');
        }
    }, [teamTurn]);

    useEffect(() => {
        timeRef.current = time;
    }, [time]);

    useEffect(() => {
        switch (timerState) {
            case 'PAUSED':
                clearInterval(timerRef.current ?? 0);
                break;
            case 'ACTIVE':
                timerRef.current = setInterval(() => {
                    if ((timeRef.current ?? 0) - 10 === 0) {
                        setTimerState('COMPLETE');
                    } else {
                        setTime((prev) => prev - 10);
                    }
                }, 10);
                break;
            case 'COMPLETE':
                clearInterval(timerRef.current ?? 0);
                break;
        }
    }, [timerState]);

    const processTime = (milliseconds: number) => {
        const seconds: number = Math.floor(milliseconds / 1000);
        const minutes: number = Math.floor(seconds / 60);

        const displayedSeconds: number = seconds - minutes * 60;
        const displayedMilSecs: number = (milliseconds - displayedSeconds * 1000 - minutes * 60 * 1000) / 10; 
        
        const paddedSeconds: string = String(displayedSeconds).padStart(2, "0");
        const paddedMinutes: string = String(minutes).padStart(2, "0");
        // Removed the padding but still naming as that
        const paddedMilSecs: string = String(Math.floor(displayedMilSecs / 10));
        
        return `${paddedMinutes}:${paddedSeconds}.${paddedMilSecs}`;
    }

    return (
        <>
            <div style={{ 
                position: 'relative',
                display: 'flex', 
                textAlign: 'center', 
                alignItems: 'center', 
                width: 'stretch',
                color: '#000',
                borderColor: BorderColorState[timerState],
                borderStyle: 'solid',
                borderWidth: '.25rem',
                borderRadius: '1rem',
                padding: '.5rem',
                backgroundColor: '#FFF',
                transitionProperty: 'all',
                transitionDuration: '500ms',
                transitionTimingFunction: 'ease-in',
                justifyContent: 'space-between',
                margin: '.25rem',
            }}>
                <div style={{ 
                    position: 'absolute',
                    display: 'flex',
                    width: 'stretch',
                    height: 'stretch',
                    inset: '5% 2%',
                    fontSize: '.8rem',
                }}>                
                    <div
                        style={{
                            position: 'absolute',
                            inset: '0% 0% -10% 60%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <p
                            style={{
                                margin: 'inherit',
                                alignSelf: 'flex-end',
                                color: 'black', 
                                backgroundColor: BorderColorState[timerState],
                                transitionProperty: 'all',
                                transitionDuration: '500ms',
                                transitionTimingFunction: 'ease-in',
                                padding: '0 5px 0 5px',
                                borderRadius: '.25rem'
                            }}
                        >{timerState === 'ACTIVE' ? `${capitalizeString(teamType)}'s Turn` : 'Waiting'}</p>
                    </div>
                </div>
                <p style={{ margin: 'inherit' }}>{capitalizeString(teamType)}:</p> 
                <p style={{ margin: 'inherit' }}>{processTime(time)}</p>
            </div>
        </>
    );
    
}