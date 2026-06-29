import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-lg mx-auto animate-fade-in-up">
        <motion.img 
          src="/images/404.png" 
          alt="Page Not Found" 
          className="w-64 h-auto mx-auto mb-8 drop-shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ y: -5 }}
        />
        <h1 className="text-4xl font-extrabold text-neutral-950 tracking-tight mb-4">
          Oops! Page not found
        </h1>
        <p className="text-neutral-500 font-medium mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
