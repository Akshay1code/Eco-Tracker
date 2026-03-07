import React, { useState } from 'react';
import './Dashboard.css';
import HeroCard from './HeroCard';
import MetricsGrid from './MetricsGrid';
import EcoCalendar from './EcoCalendar';
import CommunityRankings from './CommunityRankings';
import EcoToDo from './EcoToDo';
import MotivationPanel from './MotivationPanel';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            {/* Background floaters */}
            <div className="bg-leaf bg-leaf-1"></div>
            <div className="bg-leaf bg-leaf-2"></div>
            <div className="bg-leaf bg-leaf-3"></div>

            <header className="dashboard-header">
                <h1>EcoJourney</h1>
                <p className="subtitle">Carbon Tracker RPG</p>
            </header>

            <main className="dashboard-main">
                <section className="dashboard-left">
                    <HeroCard />
                    <MotivationPanel />
                </section>

                <section className="dashboard-center">
                    <MetricsGrid />
                    <EcoToDo />
                </section>

                <section className="dashboard-right">
                    <EcoCalendar />
                    <CommunityRankings />
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
