import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <header>
                <h1>Health Coach AI</h1>
            </header>
            <main>{children}</main>
            <footer style={{ marginTop: '20px', textAlign: 'center' }}>
                <p>&copy; {new Date().getFullYear()} Health Coach App</p>
            </footer>
        </div>
    );
};

export default Layout;