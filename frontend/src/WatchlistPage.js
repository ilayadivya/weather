import React from 'react';
import { Link } from 'react-router-dom';

const WatchlistPage = ({ watchlist, setDefaultLocation }) => {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Weather App</h2>
        <ul>
          <li>
            <Link to="/search">Search Locations</Link>
          </li>
          <li>
            <Link to="/watchlist">Watchlist</Link>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h2>Your Watchlist</h2>
          <p>Manage your watchlisted locations and set your default location.</p>
        </header>

        {/* Watchlist Items */}
        <div className="watchlist-items">
          {watchlist.length === 0 ? (
            <p>Your watchlist is empty. Add locations to start tracking them.</p>
          ) : (
            <ul>
              {watchlist.map((location, index) => (
                <li key={index}>
                  {location}
                  <button onClick={() => setDefaultLocation(location)}>Set as Default</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
