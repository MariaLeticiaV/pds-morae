import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/userAuth.js';
import './AccountMenu.css';

export function AccountMenu({ className = '', children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  function handleLogout() {
    logoutUser();
    setOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className={`account-menu-trigger ${className}`.trim()}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {children}
      </button>
      {open && (
        <div className="account-menu-dropdown" role="menu">
          <Link to="/perfil" role="menuitem" onClick={() => setOpen(false)}>
            Meu Perfil
          </Link>
          <button className="account-menu-logout" type="button" role="menuitem" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
