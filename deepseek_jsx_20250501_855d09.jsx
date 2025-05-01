import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FiHome, FiBox, FiHeart, FiUser, FiMenu, FiX, FiDownload, FiSearch } from 'react-icons/fi';

const supabase = createClient(
  'https://poafexfhsgtaixggzthn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYWZleGZoc2d0YWl4Z2d6dGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMzc1MzgsImV4cCI6MjA2MTYxMzUzOH0.DSbySFF30uDj87GmPgaO96RN-9tBYsr4D5wfu0KVdqo'
);

const queryClient = new QueryClient();

const Header = ({ onMenuToggle }) => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="font-bold text-2xl" style={{ color: '#02964c' }}>ChoiceIQ</div>
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 gap-2">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none"
          />
        </div>
      </div>
      <button onClick={onMenuToggle} className="p-2 hover:bg-gray-100 rounded-lg">
        <FiMenu className="text-2xl" />
      </button>
    </div>
  </header>
);

const ProductCard = ({ product, session }) => {
  const handleDownload = async () => {
    if (!session) return alert('Please login to download');
    
    const { error } = await supabase
      .from('downloads')
      .insert([{ user_id: session.user.id, product_id: product.id }]);

    if (!error) {
      window.open(product.download_link, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.image_url} 
        alt={product.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="line-through text-gray-400">${product.original_price}</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              Free in Choice Store
            </span>
          </div>
          <span className="text-sm text-gray-500">{product.download_count} downloads</span>
        </div>
        <button
          onClick={handleDownload}
          className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
        >
          <FiDownload /> Download Now
        </button>
      </div>
    </div>
  );
};

const AuthModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (!error) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-black text-white py-2 rounded">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-gray-600 hover:underline"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const { data: products } = useQuery(['products'], async () => {
    const { data } = await supabase.from('products').select('*');
    return data;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Header onMenuToggle={() => setMenuOpen(true)} />
        
        {menuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20">
            <div className="bg-white h-full w-64 p-4 ml-auto">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setMenuOpen(false)}><FiX /></button>
              </div>
              <nav className="space-y-2">
                <Link to="/about" className="block p-2 hover:bg-gray-100">About Us</Link>
                <Link to="/contact" className="block p-2 hover:bg-gray-100">Contact</Link>
                <Link to="/privacy" className="block p-2 hover:bg-gray-100">Privacy</Link>
                <Link to="/terms" className="block p-2 hover:bg-gray-100">Terms</Link>
                <Link to="/faq" className="block p-2 hover:bg-gray-100">FAQ</Link>
              </nav>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map(product => (
                  <ProductCard key={product.id} product={product} session={session} />
                ))}
              </div>
            }/>
            <Route path="/profile" element={
              session ? (
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Profile</h2>
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button 
                    onClick={() => setShowAuth(true)}
                    className="bg-black text-white px-6 py-3 rounded-lg"
                  >
                    Login / Sign Up
                  </button>
                </div>
              )
            }/>
          </Routes>
        </main>

        <nav className="fixed bottom-0 w-full bg-white border-t">
          <div className="container mx-auto px-4 py-2 flex justify-around">
            <Link to="/" className="p-2"><FiHome className="text-2xl" /></Link>
            <Link to="/products" className="p-2"><FiBox className="text-2xl" /></Link>
            <Link to="/favorites" className="p-2"><FiHeart className="text-2xl" /></Link>
            <Link to="/profile" className="p-2"><FiUser className="text-2xl" /></Link>
          </div>
        </nav>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </Router>
    </QueryClientProvider>
  );
};

export default App;