import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/home.css';
import { BiHome, BiLibrary, BiSearch, BiPlus } from 'react-icons/bi';

const Home = () => {
    return (
        <div className="home-container">
            <div className="sidebar">
                <div className="nav-menu">
                    <Link to="/" className="menu-item active">
                        <BiHome className="menu-icon" />
                        <span>Home</span>
                    </Link>
                    <Link to="/search" className="menu-item">
                        <BiSearch className="menu-icon" />
                        <span>Search</span>
                    </Link>
                </div>
                
                <div className="library-section">
                    <div className="library-header">
                        <div className="library-title">
                            <BiLibrary className="menu-icon" />
                            <span>Your Library</span>
                        </div>
                        <button className="add-playlist">
                            <BiPlus />
                        </button>
                    </div>
                    
                    <div className="library-content">
                        <div className="create-playlist-card">
                            <h2>Create your first playlist</h2>
                            <p>It's easy, we'll help you</p>
                            <button className="create-playlist-btn">Create playlist</button>
                        </div>
                        
                        <div className="browse-podcasts-card">
                            <h2>Let's find some podcasts to follow</h2>
                            <p>We'll keep you updated on new episodes</p>
                            <button className="browse-podcasts-btn">Browse podcasts</button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="main-content">
                <div className="content-grid">
                    <section className="featured-section">
                        <h1>Good afternoon</h1>
                        <div className="featured-grid">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="featured-item">
                                    <div className="playlist-image"></div>
                                    <span className="playlist-name">Playlist {item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="made-for-you">
                        <h2>Made For You</h2>
                        <div className="playlist-grid">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="playlist-card">
                                    <div className="playlist-image"></div>
                                    <h3>Daily Mix {item}</h3>
                                    <p>Your daily music mix</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Home;
