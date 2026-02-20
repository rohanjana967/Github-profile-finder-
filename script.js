const { useState, useEffect } = React;

const GitHubProfileFinder = () => {
    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('repos');

    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setDarkMode(savedTheme === 'true');
        }
    }, []);

    useEffect(() => {
        document.body.className = darkMode 
            ? 'min-h-screen bg-gray-900 text-gray-100 theme-transition'
            : 'min-h-screen bg-gray-50 text-gray-900 theme-transition';
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const fetchProfile = async () => {
        if (!username.trim()) {
            setError('Please enter a GitHub username');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const profileResponse = await fetch(`https://api.github.com/users/${username}`);
            if (!profileResponse.ok) throw new Error('User not found');
            const profileData = await profileResponse.json();
            setProfile(profileData);

            const reposResponse = await fetch(profileData.repos_url);
            const reposData = await reposResponse.json();
            setRepos(reposData);

            const followersResponse = await fetch(profileData.followers_url);
            const followersData = await followersResponse.json();
            setFollowers(followersData);

        } catch (err) {
            setError(err.message);
            setProfile(null);
            setRepos([]);
            setFollowers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchProfile();
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const formatNumber = (num) => {
        if (!num) return 0;
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <header className={`py-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>GitHub</span> Profile Finder
                    </h1>
                    <button 
                        onClick={toggleTheme}
                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    >
                        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GitHub username"
                                className={`flex-grow px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                            <button
                                type="submit"
                                className={`px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className={`p-4 mb-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-900'}`}>
                            {error}
                        </div>
                    )}

                    {loading && !profile && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-full skeleton bg-gray-300 dark:bg-gray-700"></div>
                                <div className="space-y-2">
                                    <div className="h-6 w-48 skeleton bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="h-4 w-32 skeleton bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`p-4 rounded-lg skeleton bg-gray-300 dark:bg-gray-700 h-24`}></div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`p-4 rounded-lg skeleton bg-gray-300 dark:bg-gray-700 h-24`}></div>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile && (
                        <div>
                            <div className={`flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
                                <div className="flex-shrink-0">
                                    <img 
                                        src={profile.avatar_url} 
                                        alt={`Profile picture of ${profile.name || profile.login}`}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-500"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-2xl font-bold mb-1">
                                        {profile.name || profile.login}
                                        {profile.name && <span className="text-gray-500 font-normal ml-2">@{profile.login}</span>}
                                    </h2>
                                    {profile.bio && <p className="mb-3">{profile.bio}</p>}
                                    {profile.blog && (
                                        <a 
                                            href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`inline-block mb-3 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                        >
                                            {profile.blog}
                                        </a>
                                    )}
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                        {profile.location && (
                                            <div className="flex items-center">
                                                <span className="mr-1">📍</span>
                                                <span>{profile.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`grid gap-4 md:grid-cols-3 mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow text-center`}>
                                    <div className="text-sm mb-1">Public Repos</div>
                                    <div className="text-3xl font-bold">{formatNumber(profile.public_repos)}</div>
                                </div>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow text-center`}>
                                    <div className="text-sm mb-1">Followers</div>
                                    <div className="text-3xl font-bold">{formatNumber(profile.followers)}</div>
                                </div>
                                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow text-center`}>
                                    <div className="text-sm mb-1">Following</div>
                                    <div className="text-3xl font-bold">{formatNumber(profile.following)}</div>
                                </div>
                            </div>

                            <div className={`mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                <div className="flex border-b">
                                    <button
                                        className={`px-4 py-2 font-medium ${activeTab === 'repos' ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')}`}
                                        onClick={() => setActiveTab('repos')}
                                    >
                                        Repositories ({repos.length})
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium ${activeTab === 'followers' ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')}`}
                                        onClick={() => setActiveTab('followers')}
                                    >
                                        Followers ({followers.length})
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'repos' && (
                                <div className="space-y-4">
                                    {repos.length === 0 ? (
                                        <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                                            No repositories found
                                        </div>
                                    ) : (
                                        repos.map(repo => (
                                            <div key={repo.id} className={`repo-card p-4 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-grow">
                                                        <a 
                                                            href={repo.html_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={`text-lg font-medium mb-1 inline-block ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                                        >
                                                            {repo.name}
                                                        </a>
                                                        {repo.description && <p className="text-sm mb-2">{repo.description}</p>}
                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                                            {repo.language && (
                                                                <span className="flex items-center">
                                                                    <span className={`inline-block w-3 h-3 rounded-full ${repo.language === 'JavaScript' ? 'bg-yellow-400' : repo.language === 'TypeScript' ? 'bg-blue-600' : repo.language === 'HTML' ? 'bg-red-500' : repo.language === 'CSS' ? 'bg-purple-500' : 'bg-gray-500'}`}></span>
                                                                    <span className="ml-1">{repo.language}</span>
                                                                </span>
                                                            )}
                                                            <span className="flex items-center">
                                                                <span>🔄</span>
                                                                <span className="ml-1">Updated {formatDate(repo.updated_at)}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'followers' && (
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {followers.length === 0 ? (
                                        <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                                            No followers found
                                        </div>
                                    ) : (
                                        followers.map(follower => (
                                            <a 
                                                key={follower.id} 
                                                href={follower.html_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
                                            >
                                                <img 
                                                    src={follower.avatar_url} 
                                                    alt={`Profile picture of ${follower.login}`}
                                                    className="w-12 h-12 rounded-full mr-3"
                                                />
                                                <div>
                                                    <div className="font-medium">{follower.login}</div>
                                                </div>
                                            </a>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<GitHubProfileFinder />);