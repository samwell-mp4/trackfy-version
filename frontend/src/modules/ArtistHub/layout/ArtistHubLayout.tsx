<div className="hub-footer">
    <button onClick={logout} className="logout-btn-sidebar">
        <LogOut size={18} />
        <span>Sair da Conta</span>
    </button>
</div>
            </aside >
    <main className="hub-content">
        <Outlet />
    </main>
        </div >
    );
};
