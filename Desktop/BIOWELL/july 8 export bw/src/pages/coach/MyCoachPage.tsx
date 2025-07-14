import React from 'react';
import { User, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { useNavigate } from 'react-router-dom';

export const MyCoachPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', 
          padding: '2rem', 
          borderRadius: '1rem', 
          color: 'white', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <User size={48} />
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>MyCoach Dashboard</h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Your personalized health companion</p>
          </div>
        </div>
        
        <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2>Welcome to MyCoach! 👋</h2>
          <p>MyCoach is your intelligent health companion for personalized supplement recommendations and wellness guidance.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="primary" onClick={() => navigate('/chat')}>
              <MessageCircle size={20} />
              Chat with MyCoach
            </Button>
            <Button variant="outline" onClick={() => navigate('/shop')}>
              <ShoppingBag size={20} />
              Shop Recommendations
            </Button>
          </div>
        </Card>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>��</div>
            <h3>Personalized Recommendations</h3>
            <p>AI-powered supplement suggestions tailored to your health goals.</p>
          </Card>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <h3>24/7 AI Assistant</h3>
            <p>Chat with MyCoach anytime for health and wellness guidance.</p>
          </Card>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your wellness journey with personalized insights.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default MyCoachPage;
