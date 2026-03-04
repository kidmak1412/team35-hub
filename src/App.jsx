import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Image as ImageIcon, TrendingUp, Calculator, Percent, 
  Table, FileText, HeartPulse, LogOut, User, Users, Settings, Shield, 
  UploadCloud, Plus, Trash2, CheckCircle, FileSpreadsheet, PlayCircle, Menu, X, Eye, EyeOff, Edit, Save, Clock, Trophy, Share2, Printer, Download,
  AlertTriangle, Info, Loader2
} from 'lucide-react';

// ==========================================
// 🔴 ใส่ URL จาก Google Apps Script ที่นี่ 🔴
// (หากยังไม่มี โค้ดจะใช้ข้อมูลจำลองแทน เพื่อไม่ให้จอขาว)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbwqgjSeHNVtImXq6ncvrDAhtk6TP1wH-GwZ4A-64_vxqL8DUqyCLMrq5SsWg42lxObz/exec";

// --- ฟังก์ชันช่วยเหลือ ---
const generateCanvasImage = async (elementId, formatWidth) => {
  try {
    await document.fonts.ready;
    if (!window.html2canvas) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await window.html2canvas(element, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      letterRendering: true,
      windowWidth: formatWidth,
    });
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error("Canvas generation error", error);
    return null;
  }
};

const getFormattedDate = () => {
  const d = new Date();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`;
};

// --- API Helper ---
const fetchApi = async (action, payload = {}) => {
  if(API_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") return null; // ข้ามการเรียก API ถ้ายังไม่ได้ใส่ URL
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const result = await response.json();
    if (result.status === 'success') return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// --- MOCK DATA ---
const initialUsers = [
  { id: 1, username: 'admin', password: 'password', role: 'admin', name: 'ผู้ดูแลระบบสูงสุด' },
  { 
    id: 2, username: 'agent01', password: 'password', role: 'member', name: 'ตัวแทน ทดสอบ', 
    targetFYP: 1000000, 
    performanceRecords: [
      { month: 'มกราคม', submitted: 150000, approved: 100000, commission: 35000, lastUpdated: '31 ม.ค. 2024 16:30' },
      { month: 'กุมภาพันธ์', submitted: 350000, approved: 350000, commission: 122500, lastUpdated: '28 ก.พ. 2024 09:15' }
    ],
    specialQualifications: []
  }
];

const initialQuals = [
  { id: 1, name: 'ทริปญี่ปุ่น (Q3)', target: 800000 }, 
  { id: 2, name: 'MDOT 2024', target: 1500000 },
  { id: 3, name: 'MBRT 2027', target: 1200000 }
];

const initialVideos = [
  { id: 1, title: 'เทคนิคการเปิดใจลูกค้า', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'ทักษะการขาย' },
  { id: 2, title: 'สรุปแบบประกันสุขภาพ อัปเดต 2024', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'ความรู้แบบประกัน' }
];

const initialContents = [
  { id: 1, type: 'image', title: 'ภาพสวัสดีวันจันทร์ พร้อมคำคม', url: 'https://placehold.co/400x400/0B162C/D4AF37?text=Happy+Monday' },
  { id: 2, type: 'video', title: 'คลิปสั้น โปรโมทประกันออมทรัพย์', url: 'https://placehold.co/400x400/D4AF37/0B162C?text=Video+Content' },
  { id: 3, type: 'caption', title: 'แคปชั่นขายประกันสุขภาพ', content: 'สุขภาพดีไม่มีขาย อยากได้ต้องดูแลตัวเอง... แต่ถ้าเจ็บป่วยขึ้นมา ให้เราดูแลค่าใช้จ่ายนะครับ 💙 #ประกันสุขภาพ #คุ้มครองคุ้มค่า' }
];

const memberMenu = [
  { id: 'video_hub', icon: Video, label: 'คลังวีดีโอความรู้' },
  { id: 'content_hub', icon: ImageIcon, label: 'คลังคอนเทนต์ฟรี' },
  { id: 'performance', icon: TrendingUp, label: 'ติดตามผลงาน & คุณวุฒิ' },
  { id: 'comm_calc', icon: Percent, label: 'คำนวณค่าคอมมิชชั่น' },
  { id: 'irr_calc', icon: Calculator, label: 'คำนวณ IRR' },
  { id: 'savings_pres', icon: FileSpreadsheet, label: 'ตารางเสนอออมทรัพย์' },
  { id: 'income_pres', icon: FileText, label: 'ตารางเสนอชดเชยรายได้' },
  { id: 'legacy_pres', icon: Table, label: 'ตารางเสนอประกันมรดก' },
  { id: 'health_pres', icon: HeartPulse, label: 'ตารางเสนอสุขภาพ 3-5 แผน' },
];

const adminMenu = [
  { id: 'admin_dashboard', icon: Users, label: 'จัดการข้อมูลสมาชิก' },
  { id: 'admin_performance', icon: TrendingUp, label: 'จัดการเป้าหมายเบี้ย&คุณวุฒิ' },
  { id: 'admin_videos', icon: Video, label: 'จัดการคลังความรู้' },
  { id: 'admin_contents', icon: ImageIcon, label: 'จัดการคลังคอนเทนต์' },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  
  // ใช้ Mock Data เป็นค่าเริ่มต้น (เพื่อไม่ให้เว็บพังหากยังไม่เชื่อม API)
  const [usersDb, setUsersDb] = useState(initialUsers);
  const [videosDb, setVideosDb] = useState(initialVideos);
  const [contentsDb, setContentsDb] = useState(initialContents);
  const [qualificationsDb, setQualificationsDb] = useState(initialQuals);
  const [globalTargetFYP, setGlobalTargetFYP] = useState(1000000); 
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm });
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  useEffect(() => {
    // เพิ่มฟอนต์
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // ดึงข้อมูลจาก API เมื่อเริ่มต้น
    const loadData = async () => {
      const data = await fetchApi('getAllData');
      if(data) {
        if(data.users) setUsersDb(data.users);
        if(data.videos) setVideosDb(data.videos);
        if(data.contents) setContentsDb(data.contents);
        if(data.qualifications) setQualificationsDb(data.qualifications);
        if(data.globalTarget) setGlobalTargetFYP(Number(data.globalTarget));
      }
    };
    loadData();
  }, []);

  const handleLogin = (username, password) => {
    const foundUser = usersDb.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      setCurrentView(foundUser.role === 'admin' ? 'admin_dashboard' : 'video_hub');
    } else {
      showAlert('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegister = async (newUserData) => {
    const newUser = { ...newUserData, id: Date.now(), role: 'member', performanceRecords: [], specialQualifications: [] };
    setUsersDb([...usersDb, newUser]);
    
    // Sync API แบบเบื้องหลัง
    fetchApi('registerUser', newUser).catch(() => {});
    
    showAlert('สมัครสมาชิกสำเร็จ กรุณาล็อกอิน');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} onRegister={handleRegister} showAlert={showAlert} />
        <CustomDialog dialog={dialog} closeDialog={closeDialog} />
      </>
    );
  }

  const activeMenus = user.role === 'admin' ? adminMenu : memberMenu;
  const activeMenuItem = activeMenus.find(m => m.id === currentView) || activeMenus[0];
  const ActiveIcon = activeMenuItem.icon;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#0B162C] text-[#D4AF37] p-4 flex justify-between items-center z-40 shadow-md border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <img 
            src="LOGO%20TEAM%2035.jpg" 
            alt="Team 35 Logo" 
            className="w-8 h-8 object-contain bg-white rounded-md p-0.5" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
          <h1 className="font-bold text-lg truncate text-white">35 DA&K Hub</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <Sidebar 
        role={user.role} 
        currentView={currentView} 
        setCurrentView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} 
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        closeMenu={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full bg-slate-50 relative">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-[#0B162C] flex items-center gap-3">
                <ActiveIcon className="text-[#D4AF37]" size={32} />
                {activeMenuItem.label}
              </h2>
              <p className="text-[#D4AF37] font-medium mt-1">ยินดีต้อนรับ, {user.name} ({user.role})</p>
            </div>
          </header>

          {user.role === 'admin' ? (
            <>
              {currentView === 'admin_dashboard' && <AdminUsers users={usersDb} setUsers={setUsersDb} showConfirm={showConfirm} />}
              {currentView === 'admin_performance' && <AdminPerformance users={usersDb} setUsers={setUsersDb} qualifications={qualificationsDb} setQualifications={setQualificationsDb} globalTargetFYP={globalTargetFYP} setGlobalTargetFYP={setGlobalTargetFYP} showAlert={showAlert} showConfirm={showConfirm} />}
              {currentView === 'admin_videos' && <AdminVideos videos={videosDb} setVideos={setVideosDb} showAlert={showAlert} showConfirm={showConfirm} />}
              {currentView === 'admin_contents' && <AdminContents contents={contentsDb} setContents={setContentsDb} showAlert={showAlert} showConfirm={showConfirm} />}
            </>
          ) : (
            <>
              {currentView === 'video_hub' && <VideoHub videos={videosDb} />}
              {currentView === 'content_hub' && <ContentHub contents={contentsDb} showAlert={showAlert} />}
              {currentView === 'performance' && <PerformanceTracker user={user} usersDb={usersDb} setUsersDb={setUsersDb} qualificationsDb={qualificationsDb} globalTargetFYP={globalTargetFYP} showAlert={showAlert} />}
              {currentView === 'comm_calc' && <CommissionCalc />}
              {currentView === 'irr_calc' && <IRRCalculator showAlert={showAlert} user={user} />}
              {currentView === 'savings_pres' && <ImageToTool toolName="สร้างตารางเสนอประกันออมทรัพย์" resultType="savings" />}
              {currentView === 'income_pres' && <ImageToTool toolName="สร้างตารางเสนอชดเชยรายได้" resultType="income" />}
              {currentView === 'legacy_pres' && <ImageToTool toolName="สร้างตารางเสนอประกันมรดก" resultType="legacy" />}
              {currentView === 'health_pres' && <HealthPresentation />}
            </>
          )}
        </div>
      </div>

      <CustomDialog dialog={dialog} closeDialog={closeDialog} />
    </div>
  );
}

function CustomDialog({ dialog, closeDialog }) {
  if (!dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0B162C]/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-t-4 border-[#D4AF37]">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dialog.type === 'confirm' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-[#0B162C]'}`}>
             {dialog.type === 'confirm' ? <AlertTriangle size={32} /> : <Info size={32} className="text-[#D4AF37]" />}
          </div>
          <h3 className="text-lg font-bold text-[#0B162C] mb-2">{dialog.type === 'confirm' ? 'ยืนยันการทำรายการ' : 'แจ้งเตือน'}</h3>
          <p className="text-slate-600 text-sm mb-6">{dialog.message}</p>
          <div className="flex gap-3 justify-center">
            {dialog.type === 'confirm' && (
              <button onClick={closeDialog} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
            )}
            <button onClick={() => { if(dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} className="px-5 py-2.5 bg-[#0B162C] text-[#D4AF37] font-bold rounded-xl hover:bg-[#152238] shadow-md transition flex-1">
              {dialog.type === 'confirm' ? 'ตกลง' : 'รับทราบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onRegister, showAlert }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleTogglePassword = () => {
    if (showPassword) {
      setShowPassword(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      setShowPassword(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowPassword(false);
      }, 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.username, formData.password);
    } else {
      if(!formData.username || !formData.password || !formData.name) return showAlert('กรอกข้อมูลให้ครบถ้วน');
      onRegister(formData);
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B162C] flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-3xl"></div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border-t-4 border-[#D4AF37]">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-slate-50 rounded-xl flex items-center justify-center shadow-md p-2 border border-slate-100">
            <img 
              src="LOGO%20TEAM%2035.jpg" 
              alt="Team 35 Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.parentNode.innerHTML = '<div class="text-[#0B162C] font-bold text-xl">TEAM 35</div>';
              }} 
            />
          </div>
          <h1 className="text-3xl font-bold text-[#0B162C]">35 DA&K Hub</h1>
          <p className="text-[#D4AF37] font-medium mt-1">Digital Armory & Knowledge Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#0B162C] mb-1">ชื่อ-นามสกุล</label>
              <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-shadow" 
                onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#0B162C] mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-shadow" 
              onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B162C] mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-shadow" 
                onChange={e => setFormData({...formData, password: e.target.value})} />
              <button 
                type="button" 
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D4AF37] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#D4AF37] text-[#0B162C] font-bold py-3 rounded-lg hover:bg-[#C5A059] shadow-lg shadow-[#D4AF37]/30 transition-all transform hover:-translate-y-0.5">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#0B162C] hover:text-[#D4AF37] hover:underline text-sm font-medium transition-colors">
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
        
        {isLogin && (
           <div className="mt-6 p-4 bg-[#FDFBF7] border border-[#D4AF37]/30 rounded-lg text-xs text-[#0B162C] text-left">
             <p className="font-bold mb-1 text-[#D4AF37]">ทดสอบระบบ (Demo Credentials):</p>
             <p>Admin: admin / password</p>
             <p>Member: agent01 / password</p>
           </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ role, currentView, setCurrentView, onLogout, isOpen, closeMenu }) {
  const menus = role === 'admin' ? adminMenu : memberMenu;

  return (
    <>
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#0B162C]/60 z-[50] backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-[60] w-72 bg-[#0B162C] text-white transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none`}>
        
        <div className="md:hidden flex items-center justify-between p-5 border-b border-[#1A2A44] bg-[#0B162C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center p-0.5">
              <img 
                src="LOGO%20TEAM%2035.jpg" 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => { 
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span class="text-[#0B162C] font-bold text-xs">T35</span>';
                }} 
              />
            </div>
            <span className="font-bold text-[#D4AF37] text-lg">Menu</span>
          </div>
          <button onClick={closeMenu} className="text-slate-300 hover:text-white bg-[#1A2A44] p-2 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 hidden md:block border-b border-[#1A2A44] text-center">
          <div className="w-24 h-24 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg shadow-[#D4AF37]/10 overflow-hidden">
            <img 
              src="LOGO%20TEAM%2035.jpg" 
              alt="Team 35" 
              className="w-full h-full object-contain"
              onError={(e) => { 
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-[#0B162C] font-bold text-xl">T35</span>';
              }} 
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide mt-2">
            35 <span className="text-[#D4AF37]">DA&K Hub</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => setCurrentView(menu.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === menu.id ? 'bg-[#D4AF37] text-[#0B162C] shadow-md shadow-[#D4AF37]/20 font-bold' : 'text-slate-300 hover:bg-[#1A2A44] hover:text-[#D4AF37]'
                }`}
              >
                <menu.icon size={20} />
                <span className="text-left">{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#1A2A44]">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#D4AF37] hover:bg-red-900/30 hover:text-red-400 rounded-xl transition-colors font-medium">
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </>
  );
}

function VideoHub({ videos }) {
  const categories = [...new Set(videos.map(v => v.category))];
  const [activeCat, setActiveCat] = useState('All');

  const filtered = activeCat === 'All' ? videos : videos.filter(v => v.category === activeCat);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setActiveCat('All')} className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCat === 'All' ? 'bg-[#0B162C] text-[#D4AF37]' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#D4AF37]'}`}>ทั้งหมด</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCat === cat ? 'bg-[#0B162C] text-[#D4AF37]' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#D4AF37]'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(video => (
          <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-[#D4AF37]/50 hover:shadow-md transition">
            <div className="aspect-video bg-[#0B162C] relative">
              <iframe 
                className="w-full h-full absolute top-0 left-0" 
                src={video.url} 
                title={video.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <span className="text-xs font-bold text-[#0B162C] bg-[#D4AF37]/20 px-2 py-1 rounded-md">{video.category}</span>
              <h3 className="font-bold mt-2 text-[#0B162C] line-clamp-2">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentHub({ contents, showAlert }) {
  const handleDownload = (content) => {
    showAlert(`ดาวน์โหลด / คัดลอก: ${content.title} เรียบร้อยแล้ว`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col hover:border-[#D4AF37]/50 transition">
          {item.type !== 'caption' && (
            <div className="aspect-square bg-slate-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center relative group border border-slate-100">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0B162C]/60 hidden group-hover:flex items-center justify-center transition">
                <button onClick={() => handleDownload(item)} className="bg-[#D4AF37] text-[#0B162C] px-6 py-2 rounded-lg font-bold flex items-center gap-2 transform hover:scale-105 transition">
                  <UploadCloud className="rotate-180" size={20} /> โหลด
                </button>
              </div>
            </div>
          )}
          {item.type === 'caption' && (
            <div className="flex-1 bg-[#FDFBF7] p-4 rounded-lg mb-4 text-sm text-[#0B162C] border border-dashed border-[#D4AF37]/40">
              "{item.content}"
            </div>
          )}
          <div className="mt-auto">
            <h3 className="font-bold text-[#0B162C]">{item.title}</h3>
            <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-3">{item.type}</p>
            {item.type === 'caption' && (
              <button onClick={() => handleDownload(item)} className="w-full bg-[#0B162C] text-[#D4AF37] py-2 rounded-lg font-medium hover:bg-[#152238] transition shadow-md shadow-[#0B162C]/10">
                คัดลอกข้อความ
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PerformanceTracker({ user, usersDb, setUsersDb, qualificationsDb, globalTargetFYP, showAlert }) {
  const currentUser = usersDb.find(u => u.id === user.id) || {};
  const targetFYP = globalTargetFYP;
  const performanceRecords = currentUser.performanceRecords || [];
  const specialQualifications = currentUser.specialQualifications || [];
  
  const allQuals = [...qualificationsDb, ...specialQualifications];
  
  const totalSubmitted = performanceRecords.reduce((sum, record) => sum + record.submitted, 0);
  const totalApproved = performanceRecords.reduce((sum, record) => sum + record.approved, 0);
  const totalCommission = performanceRecords.reduce((sum, record) => sum + (record.commission || 0), 0);
  
  const percent = targetFYP > 0 ? Math.min((totalApproved / targetFYP) * 100, 100) : 0;

  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = months[currentMonthIndex];
  const defaultMonth = currentMonthName;
  
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [inputSub, setInputSub] = useState(0);
  const [inputApp, setInputApp] = useState(0);
  const [inputComm, setInputComm] = useState(0);
  const [lastUpdatedDisplay, setLastUpdatedDisplay] = useState('');
  
  const [exportStep, setExportStep] = useState('none'); 
  const [exportFormat, setExportFormat] = useState('4:5'); 
  const [timestamp, setTimestamp] = useState('');
  const [selectedQualIds, setSelectedQualIds] = useState([]);
  
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const record = performanceRecords.find(r => r.month === selectedMonth);
    if (record) {
      setInputSub(record.submitted);
      setInputApp(record.approved);
      setInputComm(record.commission || 0);
      setLastUpdatedDisplay(record.lastUpdated || '');
    } else {
      const otherRecords = performanceRecords.filter(r => r.month !== selectedMonth);
      const sumSubOther = otherRecords.reduce((s, r) => s + r.submitted, 0);
      const sumAppOther = otherRecords.reduce((s, r) => s + r.approved, 0);
      const pendingFYP = sumSubOther - sumAppOther;
      
      setInputSub(pendingFYP > 0 ? pendingFYP : 0);
      setInputApp(0);
      setInputComm(0);
      setLastUpdatedDisplay('');
    }
  }, [selectedMonth, performanceRecords]);

  useEffect(() => {
    if (exportStep === 'preview') {
      generatePreview();
    }
  }, [exportStep, exportFormat]);

  const generatePreview = async () => {
    setIsGenerating(true);
    setPreviewImageUrl(null);
    
    setTimeout(async () => {
      const width = exportFormat === '4:5' ? 800 : 794;
      const imageUrl = await generateCanvasImage('hidden-export-node', width);
      if (imageUrl) {
        setPreviewImageUrl(imageUrl);
      } else {
        showAlert('ไม่สามารถสร้างภาพตัวอย่างได้');
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleUpdatePerformance = (e) => {
    e.preventDefault();
    const existingRecordIndex = performanceRecords.findIndex(r => r.month === selectedMonth);
    let newRecords = [...performanceRecords];
    
    const timestampStr = getFormattedDate();
    
    const recordData = { 
      month: selectedMonth, 
      submitted: Number(inputSub), 
      approved: Number(inputApp),
      commission: Number(inputComm),
      lastUpdated: timestampStr
    };

    if (existingRecordIndex >= 0) {
      newRecords[existingRecordIndex] = recordData;
    } else {
      newRecords.push(recordData);
    }

    setUsersDb(usersDb.map(u => 
      u.id === user.id ? { ...u, performanceRecords: newRecords } : u
    ));
    showAlert(`อัปเดตผลงานเดือน ${selectedMonth} เรียบร้อยแล้ว`);
  };

  let pastApprovedFYP = 0;
  performanceRecords.forEach(r => {
    const rMonthIndex = months.indexOf(r.month);
    if (rMonthIndex < currentMonthIndex) {
      pastApprovedFYP += r.approved;
    }
  });

  const remainingFYP = Math.max(0, targetFYP - pastApprovedFYP);
  const remainingMonths = 12 - currentMonthIndex; 
  const dynamicMonthlyGoal = remainingMonths > 0 ? Math.ceil(remainingFYP / remainingMonths) : 0;

  const currentMonthRecord = performanceRecords.find(r => r.month === currentMonthName) || { approved: 0 };
  const currentMonthApproved = currentMonthRecord.approved;
  const monthlyPercent = dynamicMonthlyGoal > 0 ? Math.min((currentMonthApproved / dynamicMonthlyGoal) * 100, 100) : (currentMonthApproved > 0 ? 100 : 0);

  const handleOpenExportConfig = () => {
    setSelectedQualIds(allQuals.map(q => q.id)); 
    setExportFormat('4:5');
    setExportStep('config');
  };

  const handleConfirmConfigAndGenerate = () => {
    setTimestamp(getFormattedDate());
    setExportStep('preview');
  };

  const handlePrint = () => {
     if (previewImageUrl) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
           printWindow.document.write(`
              <html>
                <head>
                  <title>Performance Report</title>
                  <style>
                    body { margin: 0; padding: 0; display: flex; justify-content: center; background: #fff; }
                    img { max-width: 100%; height: auto; }
                    @page { margin: 0; size: auto; }
                  </style>
                </head>
                <body>
                  <img src="${previewImageUrl}" onload="window.print(); window.close();" />
                </body>
              </html>
           `);
           printWindow.document.close();
        }
     }
  };

  const handleDownloadImage = () => {
    if (previewImageUrl) {
      const link = document.createElement('a');
      link.download = `Performance_Report_${currentUser.name}.jpg`;
      link.href = previewImageUrl;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
         <button onClick={handleOpenExportConfig} className="bg-[#D4AF37] text-[#0B162C] px-5 py-2.5 rounded-xl font-bold hover:bg-[#C5A059] shadow-md transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <Share2 size={18}/> แชร์เอกสารผลงาน
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#0B162C]"><TrendingUp className="text-[#D4AF37]"/> ภาพรวมเป้าหมายปีนี้ (FYP)</h3>
          
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-600">อนุมัติแล้วรวม: {totalApproved.toLocaleString()} บาท</span>
            <span className="text-[#0B162C] font-bold">เป้าหมายทั้งปี: {targetFYP.toLocaleString()} บาท</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
          </div>
          
          <p className="text-center text-slate-500 text-sm">
            ขาดอีก <span className="font-bold text-[#D4AF37]">{Math.max(0, targetFYP - totalApproved).toLocaleString()}</span> บาท เพื่อพิชิตเป้าหมาย!
          </p>
        </div>

        <div className="bg-[#FDFBF7] p-6 rounded-2xl shadow-sm border border-[#D4AF37]/40 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10 text-[#D4AF37]"><TrendingUp size={100} /></div>
          <h3 className="font-bold mb-2 text-[#0B162C] relative z-10 flex items-center gap-2">🎯 เป้าหมายจิ๋วเดือน{currentMonthName}</h3>
          <p className="text-xs text-slate-500 mb-4 relative z-10 leading-relaxed">
            อัปเดตอัตโนมัติจากเป้าหมายที่เหลือหารด้วย {remainingMonths} เดือนสุดท้าย
          </p>
          
          <div className="text-3xl font-black text-[#D4AF37] mb-1 relative z-10">{dynamicMonthlyGoal.toLocaleString()} <span className="text-sm font-medium text-[#0B162C]">บาท</span></div>
          <p className="text-sm font-medium text-slate-600 relative z-10 mb-3">ทำได้แล้ว: {currentMonthApproved.toLocaleString()} บาท</p>
          
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden relative z-10">
            <div className="bg-[#0B162C] h-full rounded-full transition-all" style={{ width: `${monthlyPercent}%` }}></div>
          </div>
          {currentMonthApproved >= dynamicMonthlyGoal && dynamicMonthlyGoal > 0 && (
            <p className="text-xs text-green-600 font-bold mt-2 relative z-10 flex items-center gap-1"><CheckCircle size={12}/> เยี่ยมมาก! ทะลุเป้าเดือนนี้แล้ว</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
          <h4 className="font-bold text-[#0B162C] flex items-center gap-2"><Edit className="text-[#D4AF37]" size={20}/> อัปเดตและแก้ไขผลงานรายเดือน</h4>
          {lastUpdatedDisplay && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
              <Clock size={12}/> แก้ไขล่าสุด: {lastUpdatedDisplay}
            </span>
          )}
        </div>
        
        <form onSubmit={handleUpdatePerformance} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เลือกเดือนที่ต้องการบันทึก/แก้ไข</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-[#0B162C] font-medium"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เบี้ยที่นำส่ง (บาท)</label>
            <input type="number" value={inputSub} onChange={(e) => setInputSub(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" />
            {!lastUpdatedDisplay && inputSub > 0 && <span className="text-xs text-[#D4AF37] block mt-1">* ดึงยอดรอนำส่งจากเดือนก่อนมาให้แล้ว</span>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เบี้ยที่อนุมัติแล้ว (บาท)</label>
            <input type="number" value={inputApp} onChange={(e) => setInputApp(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow bg-[#FDFBF7]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">คอมมิชชั่น (บาท)</label>
            <input type="number" value={inputComm} onChange={(e) => setInputComm(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow bg-[#F2FDF5]" />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button type="submit" className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2">
              <Save size={18} /> {lastUpdatedDisplay ? 'บันทึกการแก้ไขยอด' : `บันทึกผลงานเดือน ${selectedMonth}`}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h4 className="font-bold text-[#0B162C] mb-4 flex items-center gap-2"><FileSpreadsheet className="text-[#D4AF37]" size={20}/> ประวัติผลงานรายเดือนที่บันทึกแล้ว</h4>
        {performanceRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-[#FDFBF7] border-b border-[#D4AF37]/30">
                <tr>
                  <th className="p-4 font-bold text-slate-600">เดือนที่บันทึก</th>
                  <th className="p-4 font-bold text-slate-600 text-right">เบี้ยนำส่ง (บาท)</th>
                  <th className="p-4 font-bold text-[#0B162C] text-right">เบี้ยอนุมัติ (บาท)</th>
                  <th className="p-4 font-bold text-green-700 text-right">คอมมิชชั่น (บาท)</th>
                  <th className="p-4 font-bold text-slate-500 text-right text-xs">อัปเดตล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...performanceRecords]
                  .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month))
                  .map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="p-4 font-medium text-[#0B162C]">{record.month}</td>
                    <td className="p-4 text-right text-slate-600">{record.submitted.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-[#0B162C]">{record.approved.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-green-600">{(record.commission || 0).toLocaleString()}</td>
                    <td className="p-4 text-right text-xs text-slate-400">{record.lastUpdated || '-'}</td>
                  </tr>
                ))}
                <tr className="bg-[#0B162C] text-[#D4AF37]">
                  <td className="p-4 font-bold text-white text-right">รวมทั้งสิ้นปีนี้</td>
                  <td className="p-4 font-bold text-right">{totalSubmitted.toLocaleString()}</td>
                  <td className="p-4 font-bold text-right text-[#D4AF37] text-lg">{totalApproved.toLocaleString()}</td>
                  <td className="p-4 font-bold text-right text-green-400 text-lg">{totalCommission.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">ยังไม่มีข้อมูลผลงานที่บันทึก</p>
            <p className="text-xs text-slate-400 mt-1">อัปเดตผลงานของคุณด้านบนเพื่อดูสรุปรายเดือน</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-[#0B162C] mb-2">คุณวุฒิที่มีสิทธิเข้าร่วม</h4>
            {qualificationsDb.length > 0 ? (
              <ul className="space-y-4 mt-4">
                {[...qualificationsDb].sort((a, b) => a.target - b.target).map((qual, idx) => {
                  const qualPercent = qual.target > 0 ? Math.min((totalApproved / qual.target) * 100, 100) : 0;
                  const isAchieved = totalApproved >= qual.target;
                  
                  return (
                    <li key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden hover:border-[#D4AF37]/30 transition-colors">
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <span className="font-bold text-[#0B162C] flex items-center gap-2"><Trophy size={16} className={isAchieved ? "text-green-500" : "text-[#D4AF37]"}/> {qual.name}</span>
                          <span className="text-xs text-slate-500 block mt-1">เป้าหมาย: {qual.target.toLocaleString()} บาท</span>
                        </div>
                        {isAchieved ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> สำเร็จแล้ว</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border">ขาดอีก {(qual.target - totalApproved).toLocaleString()}</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 relative z-10">
                        <div className={`h-full rounded-full transition-all ${isAchieved ? 'bg-green-500' : 'bg-[#D4AF37]'}`} style={{ width: `${qualPercent}%` }}></div>
                      </div>
                      <div className="text-xs font-bold text-[#D4AF37] mt-2 text-right relative z-10">
                        ยอดที่ทำแล้ว: {totalApproved.toLocaleString()} บาท
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm mt-4 text-center p-4 bg-slate-50 rounded-lg">ขณะนี้ยังไม่มีการประกาศคุณวุฒิส่วนกลาง</p>
            )}

            {specialQualifications.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
                  <span className="bg-[#D4AF37] text-[#0B162C] p-1 rounded">⭐</span> คุณวุฒิพิเศษสำหรับคุณ
                </h4>
                <ul className="space-y-4">
                  {[...specialQualifications].sort((a, b) => a.target - b.target).map((qual, idx) => {
                    const qualPercent = qual.target > 0 ? Math.min((totalApproved / qual.target) * 100, 100) : 0;
                    const isAchieved = totalApproved >= qual.target;
                    
                    return (
                      <li key={idx} className="bg-[#0B162C] p-4 rounded-xl border border-[#D4AF37]/50 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] opacity-5 rounded-bl-full"></div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div>
                            <span className="font-bold text-[#D4AF37] flex items-center gap-2"><Trophy size={16} /> {qual.name}</span>
                            <span className="text-xs text-slate-300 block mt-1">เป้าหมาย: {qual.target.toLocaleString()} บาท</span>
                          </div>
                          {isAchieved ? (
                            <span className="bg-[#D4AF37] text-[#0B162C] px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"><CheckCircle size={12}/> พิชิตแล้ว</span>
                          ) : (
                            <span className="text-xs font-medium text-slate-300 bg-white/10 px-2 py-1 rounded border border-white/20">ขาดอีก {(qual.target - totalApproved).toLocaleString()}</span>
                          )}
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 relative z-10">
                          <div className={`h-full rounded-full transition-all ${isAchieved ? 'bg-[#D4AF37]' : 'bg-blue-400'}`} style={{ width: `${qualPercent}%` }}></div>
                        </div>
                        <div className="text-xs font-bold text-white mt-2 text-right relative z-10">
                          ยอดที่ทำแล้ว: {totalApproved.toLocaleString()} บาท
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
         </div>
         <div className="bg-[#0B162C] p-6 rounded-xl shadow-lg border border-[#D4AF37]/20 text-[#D4AF37] flex flex-col justify-center text-center">
            <h4 className="font-bold mb-1 opacity-90 text-white">ยอดคอมมิชชั่นสะสมทั้งปี (จริง)</h4>
            <div className="text-4xl font-black mt-3 drop-shadow-md">฿{totalCommission.toLocaleString()}</div>
            <p className="text-xs mt-4 text-slate-400">* สรุปยอดจากผลงานรายเดือนที่คุณได้บันทึกไว้ในระบบ</p>
         </div>
      </div>

      {/* --- EXPORT MODALS FLOW --- */}
      
      {exportStep === 'config' && (
        <div className="fixed inset-0 bg-[#0B162C]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-[#FDFBF7]">
               <h3 className="font-bold text-[#0B162C] text-lg flex items-center gap-2">
                 <Settings size={20} className="text-[#D4AF37]"/> ตั้งค่าการแชร์ผลงาน
               </h3>
               <button onClick={() => setExportStep('none')} className="text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm"><X size={20}/></button>
             </div>
             <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">รูปแบบกระดาษ (Layout)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setExportFormat('4:5')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === '4:5' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>ภาพ (4:5)</button>
                    <button onClick={() => setExportFormat('A4')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === 'A4' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>ขนาด A4</button>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">เลือกคุณวุฒิที่ต้องการแสดง</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                     {allQuals.map(q => (
                        <label key={q.id} className="flex items-start gap-3 cursor-pointer group p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200 shadow-sm bg-white">
                          <input 
                            type="checkbox" 
                            checked={selectedQualIds.includes(q.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedQualIds([...selectedQualIds, q.id]);
                              else setSelectedQualIds(selectedQualIds.filter(id => id !== q.id));
                            }}
                            className="mt-0.5 w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-300"
                          />
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#0B162C] leading-tight">{q.name}</span>
                        </label>
                      ))}
                      {allQuals.length === 0 && <p className="text-xs text-slate-400">ไม่มีคุณวุฒิในระบบ</p>}
                  </div>
                </div>
             </div>
             <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                <button onClick={() => setExportStep('none')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition">ยกเลิก</button>
                <button onClick={handleConfirmConfigAndGenerate} className="flex-1 py-3 bg-[#0B162C] text-[#D4AF37] font-bold rounded-xl hover:bg-[#152238] shadow-md transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                  <ImageIcon size={18}/> สร้างภาพตัวอย่าง
                </button>
             </div>
          </div>
        </div>
      )}

      {(exportStep === 'preview' || exportStep === 'config') && (
        <div className="fixed top-0 left-[-9999px] z-[-1] pointer-events-none opacity-0">
           <div id="hidden-export-node" className={`bg-white relative flex flex-col shrink-0 ${exportFormat === '4:5' ? 'w-[800px] h-[1000px]' : 'w-[794px] h-[1123px]'}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 z-0"></div>
              <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none z-0"></div>
              
              <div className={`relative z-10 flex flex-col h-full ${exportFormat === '4:5' ? 'p-10' : 'p-12'}`}>
                 
                 <div className={`flex justify-between items-center border-b-2 border-[#D4AF37] ${exportFormat === '4:5' ? 'mb-8 pb-5' : 'mb-10 pb-6'}`}>
                   <div>
                      <h2 className={`font-black text-[#0B162C] uppercase tracking-[0.15em] ${exportFormat === '4:5' ? 'text-4xl' : 'text-5xl'}`} style={{ lineHeight: 1.1 }}>PERFORMANCE</h2>
                      <h3 className={`font-bold text-[#D4AF37] uppercase tracking-widest ${exportFormat === '4:5' ? 'text-lg mt-2' : 'text-xl mt-3'}`}>REPORT {new Date().getFullYear()}</h3>
                   </div>
                   <div className={`bg-[#0B162C] rounded-2xl flex items-center justify-center shadow-md ${exportFormat === '4:5' ? 'w-20 h-20 p-3' : 'w-24 h-24 p-4'}`}>
                      <img src="LOGO%20TEAM%2035.jpg" alt="Logo" className="w-full h-full object-contain" />
                   </div>
                 </div>

                 <div className={`${exportFormat === '4:5' ? 'mb-10' : 'mb-12'}`}>
                    <p className={`font-black text-[#D4AF37] uppercase tracking-widest ${exportFormat === '4:5' ? 'text-4xl mb-2' : 'text-5xl mb-3'}`}>LIFE ADVISOR</p>
                    <h4 className={`font-black text-[#0B162C] ${exportFormat === '4:5' ? 'text-5xl' : 'text-6xl'}`} style={{ lineHeight: 1.2 }}>{currentUser?.name || ''}</h4>
                 </div>

                 <div className={`grid grid-cols-2 gap-6 ${exportFormat === '4:5' ? 'mb-10' : 'mb-12'}`}>
                    <div className={`bg-[#0B162C] rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col justify-center items-center text-center ${exportFormat === '4:5' ? 'h-36 px-4' : 'h-44 px-6'}`}>
                       <div className="flex flex-col items-center justify-center w-full -translate-y-1">
                         <p className={`text-[#D4AF37] font-bold ${exportFormat === '4:5' ? 'text-xl mb-1' : 'text-2xl mb-2'}`}>เป้าหมายทั้งปี (FYP)</p>
                         <p className={`font-black text-white leading-none pb-1 ${exportFormat === '4:5' ? 'text-5xl' : 'text-6xl'}`}>{targetFYP.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className={`bg-white rounded-3xl shadow-md border border-[#D4AF37]/50 flex flex-col justify-center items-center text-center ${exportFormat === '4:5' ? 'h-36 px-4' : 'h-44 px-6'}`}>
                       <div className="flex flex-col items-center justify-center w-full -translate-y-1">
                         <p className={`text-slate-600 font-bold ${exportFormat === '4:5' ? 'text-xl mb-1' : 'text-2xl mb-2'}`}>ผลงานอนุมัติแล้ว</p>
                         <p className={`font-black text-[#0B162C] leading-none pb-1 ${exportFormat === '4:5' ? 'text-5xl' : 'text-6xl'}`}>{totalApproved.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className={`${exportFormat === '4:5' ? 'mb-10' : 'mb-12'}`}>
                    <div className="flex justify-between items-center font-bold mb-3">
                       <span className={`text-slate-600 ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>ความสำเร็จ</span>
                       <span className={`text-[#D4AF37] ${exportFormat === '4:5' ? 'text-3xl' : 'text-4xl'}`}>{Math.floor(percent)}%</span>
                    </div>
                    <div className={`w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 ${exportFormat === '4:5' ? 'h-6' : 'h-8'}`}>
                       <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col overflow-hidden">
                    <p className={`font-bold text-slate-500 uppercase tracking-widest ${exportFormat === '4:5' ? 'mb-4 text-base' : 'mb-5 text-lg'}`}>Qualifications Achieved</p>
                    <ul className={`flex flex-col ${exportFormat === '4:5' ? 'gap-4' : 'gap-5'} overflow-hidden`}>
                      {allQuals
                        .filter(q => selectedQualIds.includes(q.id))
                        .sort((a,b) => a.target - b.target)
                        .map((qual, idx) => {
                         const isAchieved = totalApproved >= qual.target;
                         const qualPercent = qual.target > 0 ? Math.min((totalApproved / qual.target) * 100, 100) : 0;
                         
                         return (
                           <li key={idx} className={`rounded-2xl border ${exportFormat === '4:5' ? 'p-6' : 'p-8'} ${isAchieved ? 'bg-[#F2FDF5] border-[#BBF7D0]' : 'bg-white border-[#E2E8F0] shadow-sm'}`}>
                             <div className="flex justify-between items-center">
                                 <span className={`font-bold text-[#0B162C] flex items-center gap-3 ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>
                                   <Trophy size={exportFormat === '4:5' ? 28 : 32} className={isAchieved ? 'text-green-600' : 'text-slate-400'}/> <span className="-translate-y-[1px]">{qual.name}</span>
                                 </span>
                                 {isAchieved ? (
                                   <div className={`font-black text-green-700 bg-green-100 rounded-full flex items-center justify-center shadow-sm ${exportFormat === '4:5' ? 'h-10 px-5 text-base gap-2' : 'h-12 px-6 text-lg gap-2'}`}>
                                      <CheckCircle size={20} className="-translate-y-[1px]"/> <span className="pb-0.5">PASS</span>
                                   </div>
                                 ) : (
                                   <div className={`font-bold text-slate-500 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center ${exportFormat === '4:5' ? 'h-10 px-5 text-base' : 'h-12 px-6 text-lg'}`}>
                                      <span className="-translate-y-[1px]">เป้าหมาย: {qual.target.toLocaleString()} ฿</span>
                                   </div>
                                 )}
                             </div>
                             {!isAchieved && (
                                <div className="mt-5">
                                   <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${exportFormat === '4:5' ? 'h-3' : 'h-4'}`}>
                                      <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${qualPercent}%` }}></div>
                                   </div>
                                   <div className={`flex justify-between mt-2 font-medium ${exportFormat === '4:5' ? 'text-sm' : 'text-base'}`}>
                                      <span className="text-slate-500">ผลงานปัจจุบัน: <span className="text-[#0B162C]">{totalApproved.toLocaleString()} ฿</span></span>
                                      <span className="text-[#D4AF37] font-bold">{Math.floor(qualPercent)}%</span>
                                   </div>
                                </div>
                             )}
                           </li>
                         )
                      })}
                    </ul>
                 </div>

                 <div className={`border-t-2 border-[#E2E8F0] flex justify-between items-end ${exportFormat === '4:5' ? 'mt-10 pt-6' : 'mt-12 pt-8'}`}>
                    <div className={`font-bold bg-[#FDFBF7] rounded-xl text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center leading-none ${exportFormat === '4:5' ? 'h-10 px-5 text-sm' : 'h-12 px-6 text-base'}`}>
                      <span className="-translate-y-[1px]">35 DA&K Hub</span>
                    </div>
                    <div className={`text-right font-medium text-slate-500 flex flex-col gap-1 ${exportFormat === '4:5' ? 'text-sm' : 'text-base'}`}>
                      <span>Report Generated by <strong className="text-[#0B162C]">{user?.name}</strong></span>
                      <span>{timestamp}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {exportStep === 'preview' && (
        <div className="fixed inset-0 bg-[#0B162C]/90 z-[100] flex items-center justify-center p-0 md:p-4 backdrop-blur-sm">
          <div className="bg-slate-50 md:rounded-2xl w-full max-w-[95vw] shadow-2xl border-t-4 border-[#D4AF37] overflow-hidden flex flex-col h-full max-h-[100vh] md:max-h-[95vh] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
              <h3 className="font-bold text-[#0B162C] text-lg flex items-center gap-2"><Share2 className="text-[#D4AF37]"/> ภาพตัวอย่างพร้อมแชร์</h3>
              <button onClick={() => setExportStep('none')} className="text-slate-400 hover:text-red-500 bg-slate-100 rounded-full p-1 transition"><X size={24}/></button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="w-full md:w-72 bg-white p-5 border-r border-slate-200 flex flex-col gap-4 overflow-y-auto shrink-0">
                <button 
                  onClick={() => setExportStep('config')} 
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition mb-4"
                >
                  <Edit size={18}/> กลับไปตั้งค่า
                </button>
                
                <div className="space-y-3 mt-auto pt-6 border-t border-slate-200">
                  <button 
                    onClick={handleDownloadImage} 
                    disabled={isGenerating}
                    className="w-full py-3 bg-[#0B162C] text-[#D4AF37] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#152238] transition shadow-md disabled:opacity-50"
                  >
                     <Download size={18}/> บันทึกเป็นรูปภาพ
                  </button>
                  <button 
                    onClick={handlePrint} 
                    disabled={isGenerating}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                  >
                     <Printer size={18}/> แชร์เป็น PDF / A4
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-300 p-4 md:p-8 overflow-auto flex items-start justify-center w-full relative">
                {isGenerating ? (
                   <div className="flex flex-col items-center justify-center h-full text-[#0B162C]">
                      <Loader2 className="animate-spin mb-4 text-[#D4AF37]" size={40}/>
                      <p className="font-bold text-lg">กำลังประมวลผลภาพ...</p>
                      <p className="text-sm text-slate-500">กรุณารอสักครู่</p>
                   </div>
                ) : (
                   previewImageUrl && (
                      <div className="w-full flex justify-center pb-10">
                         <img 
                           src={previewImageUrl} 
                           alt="Preview" 
                           className="shadow-2xl object-contain h-max"
                           style={{ 
                             maxWidth: '100%', 
                             maxHeight: '85vh',
                             width: 'auto' 
                           }} 
                         />
                      </div>
                   )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommissionCalc() {
  const [premium, setPremium] = useState('');
  const [rate, setRate] = useState('40');
  
  const comm = (Number(premium) * Number(rate)) / 100;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold mb-6 text-center text-[#0B162C]">เครื่องมือคำนวณค่าคอมมิชชั่น</h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-[#0B162C] mb-2">เบี้ยประกันภัย (บาท)</label>
          <input type="number" value={premium} onChange={(e)=>setPremium(e.target.value)} className="w-full p-4 text-lg border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#D4AF37] outline-none transition-shadow" placeholder="0.00" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-[#0B162C] mb-2">อัตราคอมมิชชั่น (%)</label>
          <select value={rate} onChange={(e)=>setRate(e.target.value)} className="w-full p-4 text-lg border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#D4AF37] outline-none transition-shadow text-[#0B162C] font-medium">
            <option value="40">40% (ตลอดชีพ/สะสมทรัพย์ระยะยาว)</option>
            <option value="30">30% (สะสมทรัพย์ระยะกลาง)</option>
            <option value="20">20% (สุขภาพ/อนุสัญญา)</option>
            <option value="10">10% (สะสมทรัพย์ระยะสั้น)</option>
          </select>
        </div>

        <div className="pt-6 mt-6 border-t border-dashed border-slate-300">
          <div className="bg-[#0B162C] rounded-xl p-6 text-center border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/10">
            <p className="text-slate-300 font-medium mb-2">ค่าคอมมิชชั่นที่คาดว่าจะได้รับ</p>
            <p className="text-4xl font-bold text-[#D4AF37]">{comm.toLocaleString()} <span className="text-lg font-normal text-white">บาท</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IRRCalculator({ showAlert, user }) {
  const [productType, setProductType] = useState('traditional'); 
  
  const [customerName, setCustomerName] = useState('');
  const [planName, setPlanName] = useState('');
  const [initialSumAssured, setInitialSumAssured] = useState('');

  const [premium, setPremium] = useState('');
  const [payYears, setPayYears] = useState('');
  const [policyYears, setPolicyYears] = useState('');
  const [maturityBenefit, setMaturityBenefit] = useState('');
  
  const [returns, setReturns] = useState([{ id: Date.now(), startYear: '', endYear: '', amount: '' }]);
  const [dividends, setDividends] = useState([]);
  const [saSteps, setSaSteps] = useState([]); 
  const [surrenderValues, setSurrenderValues] = useState([]); 
  
  const [calcResult, setCalcResult] = useState(null);
  
  const [exportStep, setExportStep] = useState('none');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('4:5'); 
  const [includeTable, setIncludeTable] = useState(false); 
  const [timestamp, setTimestamp] = useState('');

  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (exportStep === 'preview') {
      generatePreview();
    }
  }, [exportStep, exportFormat, includeTable]);

  const generatePreview = async () => {
    setIsGenerating(true);
    setPreviewImageUrl(null);
    
    setTimeout(async () => {
      const width = exportFormat === '4:5' ? 800 : 794;
      const imageUrl = await generateCanvasImage('hidden-proposal-node', width);
      if (imageUrl) {
        setPreviewImageUrl(imageUrl);
      } else {
        showAlert('ไม่สามารถสร้างภาพตัวอย่างได้');
      }
      setIsGenerating(false);
    }, 100);
  };

  const addReturnRow = () => setReturns([...returns, { id: Date.now(), startYear: '', endYear: '', amount: '' }]);
  const removeReturnRow = (id) => setReturns(returns.filter(r => r.id !== id));
  const updateReturnRow = (id, field, value) => setReturns(returns.map(r => r.id === id ? { ...r, [field]: value } : r));

  const addDividendRow = () => { if (dividends.length < 3) setDividends([...dividends, { id: Date.now(), year: '', amount: '' }]); };
  const removeDividendRow = (id) => setDividends(dividends.filter(d => d.id !== id));
  const updateDividendRow = (id, field, value) => setDividends(dividends.map(d => d.id === id ? { ...d, [field]: value } : d));

  const addSaStepRow = () => setSaSteps([...saSteps, { id: Date.now(), startYear: '', endYear: '', percent: '' }]);
  const removeSaStepRow = (id) => setSaSteps(saSteps.filter(s => s.id !== id));
  const updateSaStepRow = (id, field, value) => setSaSteps(saSteps.map(s => s.id === id ? { ...s, [field]: value } : s));

  const addSurrenderRow = () => setSurrenderValues([...surrenderValues, { id: Date.now(), year: '', amount: '' }]);
  const removeSurrenderRow = (id) => setSurrenderValues(surrenderValues.filter(s => s.id !== id));
  const updateSurrenderRow = (id, field, value) => setSurrenderValues(surrenderValues.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleProductTypeChange = (type) => {
    setProductType(type);
    if (type === 'traditional') setDividends([]);
    setCalcResult(null);
  };

  const calculateIRRValue = (cashFlows) => {
    let minRate = -0.999;
    let maxRate = 2.0; 
    let rate = 0;
    for (let i = 0; i < 100; i++) {
      rate = (minRate + maxRate) / 2;
      let npv = 0;
      for (let j = 0; j < cashFlows.length; j++) {
        npv += cashFlows[j] / Math.pow(1 + rate, j);
      }
      if (Math.abs(npv) < 0.0001) break; 
      if (npv > 0) minRate = rate; else maxRate = rate;
    }
    return rate * 100;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!premium || !payYears || !policyYears) return showAlert('กรุณากรอกข้อมูลหลัก (เบี้ย, ปีจ่าย, ปีคุ้มครอง) ให้ครบถ้วน');

    const numPolicyYears = Number(policyYears);
    const numPayYears = Number(payYears);
    const initialSA = Number(initialSumAssured) || 0;
    
    const cfGuaranteed = new Array(numPolicyYears + 1).fill(0);
    const cfTotal = new Array(numPolicyYears + 1).fill(0);

    let totalPaid = 0;
    let totalGuaranteedRecv = 0;
    let totalDividendRecv = 0;
    
    const tableData = [];
    let cumulativePremium = 0;
    let cumulativeReturn = 0;

    for (let yr = 1; yr <= numPolicyYears; yr++) {
      const premiumPaid = yr <= numPayYears ? Number(premium) : 0;
      cumulativePremium += premiumPaid;
      
      if (yr <= numPayYears) {
        cfGuaranteed[yr - 1] -= Number(premium);
        cfTotal[yr - 1] -= Number(premium);
        totalPaid += Number(premium);
      }

      let currentSA = initialSA;
      const matchingStep = saSteps.find(s => yr >= Number(s.startYear) && yr <= Number(s.endYear));
      if (matchingStep && Number(matchingStep.percent)) {
        currentSA = (initialSA * Number(matchingStep.percent)) / 100;
      }

      let guaranteedReturn = 0;
      returns.forEach(r => {
        const start = Number(r.startYear);
        const end = Number(r.endYear);
        const amt = Number(r.amount);
        if (start && end && amt && yr >= start && yr <= end) {
          guaranteedReturn += amt;
        }
      });

      if (yr === numPolicyYears && maturityBenefit) {
        guaranteedReturn += Number(maturityBenefit);
      }

      if (guaranteedReturn > 0) {
        cfGuaranteed[yr] += guaranteedReturn;
        cfTotal[yr] += guaranteedReturn;
        totalGuaranteedRecv += guaranteedReturn;
      }

      let dividend = 0;
      if (productType === 'par') {
        const divFound = dividends.find(d => Number(d.year) === yr);
        if (divFound && Number(divFound.amount)) {
          dividend = Number(divFound.amount);
          cfTotal[yr] += dividend;
          totalDividendRecv += dividend;
        }
      }

      let sv = 0;
      const svFound = surrenderValues.find(s => Number(s.year) === yr);
      if (svFound && Number(svFound.amount)) {
        sv = Number(svFound.amount);
      }

      cumulativeReturn += (guaranteedReturn + dividend);

      tableData.push({
        year: yr,
        premium: premiumPaid,
        cumulativePremium,
        protection: currentSA,
        guaranteedReturn,
        dividend,
        surrenderValue: sv,
        cumulativeReturn
      });
    }

    const irrGuaranteed = calculateIRRValue(cfGuaranteed);
    const irrTotal = calculateIRRValue(cfTotal);
    const netProfit = (totalGuaranteedRecv + totalDividendRecv) - totalPaid;
    const profitPercent = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
    
    const bankEqG = irrGuaranteed > 0 ? (irrGuaranteed / 0.85) : 0;
    const bankEqT = irrTotal > 0 ? (irrTotal / 0.85) : 0;

    const surrenderDisplayData = surrenderValues.filter(s => Number(s.year) > 0).map(s => {
      const yr = Number(s.year);
      const svAmt = Number(s.amount) || 0;
      let cumReturn = 0;
      let cumDividend = 0;

      returns.forEach(r => {
        const start = Number(r.startYear);
        const end = Number(r.endYear);
        const amt = Number(r.amount);
        if (start && end && amt) {
          for (let i = start; i <= Math.min(yr, end); i++) {
            if (i <= numPolicyYears) cumReturn += amt;
          }
        }
      });

      if (productType === 'par') {
        dividends.forEach(d => {
          const dYr = Number(d.year);
          const dAmt = Number(d.amount);
          if (dYr && dYr <= yr && dYr <= numPolicyYears) {
            cumDividend += dAmt;
          }
        });
      }

      return {
        year: yr,
        surrenderAmount: svAmt,
        cumulativeReturn: cumReturn,
        cumulativeDividend: cumDividend,
        totalValue: svAmt + cumReturn + cumDividend
      };
    });

    setCalcResult({
      totalPaid,
      totalGuaranteedRecv,
      totalDividendRecv,
      totalRecv: totalGuaranteedRecv + totalDividendRecv,
      netProfit,
      profitPercent: profitPercent.toFixed(2),
      irrGuaranteed: irrGuaranteed.toFixed(2),
      irrTotal: irrTotal.toFixed(2),
      bankEqGuaranteed: bankEqG.toFixed(2),
      bankEqTotal: bankEqT.toFixed(2),
      surrenderDisplayData,
      tableData
    });
  };

  const handleOpenExportConfig = () => {
    if(!calcResult) return;
    setExportFormat('4:5');
    setIncludeTable(false);
    setExportStep('config');
  };

  const handleConfirmConfigAndGenerate = () => {
    setTimestamp(getFormattedDate());
    setExportStep('preview');
  };

  const resetForm = () => {
    setCustomerName(''); setPlanName(''); setInitialSumAssured('');
    setPremium(''); setPayYears(''); setPolicyYears(''); setMaturityBenefit('');
    setReturns([{ id: Date.now(), startYear: '', endYear: '', amount: '' }]);
    setDividends([]); setSaSteps([]); setSurrenderValues([]);
    setCalcResult(null);
  };

  const handlePrint = () => {
    if (previewImageUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
         printWindow.document.write(`
            <html>
              <head>
                <title>Proposal</title>
                <style>
                  body { margin: 0; padding: 0; display: flex; justify-content: center; background: #fff; }
                  img { max-width: 100%; height: auto; }
                  @page { margin: 0; size: auto; }
                </style>
              </head>
              <body>
                <img src="${previewImageUrl}" onload="window.print(); window.close();" />
              </body>
            </html>
         `);
         printWindow.document.close();
      }
   }
  };
  
  const handleDownloadImage = () => {
    if (previewImageUrl) {
      const link = document.createElement('a');
      link.download = `Proposal_${customerName || 'Client'}.jpg`;
      link.href = previewImageUrl;
      link.click();
    }
  };

  let tablePages = [];
  if (calcResult && calcResult.tableData) {
    const ROWS_PER_PAGE = 35; 
    let remainingRows = [...calcResult.tableData];
    while(remainingRows.length > 0) {
      tablePages.push(remainingRows.slice(0, ROWS_PER_PAGE));
      remainingRows = remainingRows.slice(ROWS_PER_PAGE);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 lg:p-8 min-h-[500px]">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
         <h3 className="text-xl font-bold text-[#0B162C] flex items-center gap-2"><Calculator className="text-[#D4AF37]"/> สร้างใบเสนอขาย & คำนวณ IRR</h3>
         <button onClick={resetForm} className="text-sm font-bold text-[#D4AF37] hover:underline bg-slate-50 px-3 py-1.5 rounded-lg transition">เริ่มใหม่</button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto mb-8">
        <button 
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${productType === 'traditional' ? 'bg-[#0B162C] text-[#D4AF37] shadow' : 'text-slate-500 hover:text-[#0B162C]'}`}
          onClick={() => handleProductTypeChange('traditional')}
        >
          มีเงินคืนการันตี (Traditional)
        </button>
        <button 
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${productType === 'par' ? 'bg-[#0B162C] text-[#D4AF37] shadow' : 'text-slate-500 hover:text-[#0B162C]'}`}
          onClick={() => handleProductTypeChange('par')}
        >
          มีปันผล (Par Product)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={handleCalculate} className="space-y-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-[#0B162C] border-b pb-2 flex items-center gap-2"><User size={18} className="text-[#D4AF37]"/> ข้อมูลผู้มุ่งหวัง</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อลูกค้า (สำหรับนำเสนอ)</label>
                  <input type="text" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="เช่น คุณสมชาย รักดี" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อแบบประกัน</label>
                  <input type="text" value={planName} onChange={(e)=>setPlanName(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="เช่น สะสมทรัพย์ 15/5" />
                </div>
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#D4AF37]/30 shadow-sm space-y-4">
              <h4 className="font-bold text-[#0B162C] border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2"><FileText size={18} className="text-[#D4AF37]"/> ข้อมูลเบี้ยประกัน</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-[#0B162C] mb-1">เบี้ยประกันที่ต้องจ่าย (ต่อปี)</label>
                  <input type="number" required value={premium} onChange={(e)=>setPremium(e.target.value)} className="w-full p-3 border border-[#D4AF37]/50 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] font-bold text-lg text-[#0B162C]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">จ่ายเบี้ย (ปี)</label>
                  <input type="number" required value={payYears} onChange={(e)=>setPayYears(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="เช่น 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ระยะคุ้มครอง (ปี)</label>
                  <input type="number" required value={policyYears} onChange={(e)=>setPolicyYears(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="เช่น 15" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ทุนคุ้มครองเริ่มต้น (บาท)</label>
                  <input type="number" value={initialSumAssured} onChange={(e)=>setInitialSumAssured(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-[#0B162C] border-b pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><Shield size={18} className="text-[#D4AF37]"/> เปอร์เซ็นต์ทุนประกันที่เพิ่มขึ้น</span>
                <button type="button" onClick={addSaStepRow} className="text-xs bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-100 transition shadow-sm">
                  <Plus size={14}/> เพิ่มช่วงปี
                </button>
              </h4>
              {saSteps.length === 0 && <p className="text-xs text-slate-500">หากทุนประกันคงที่ตลอดสัญญา ไม่ต้องระบุส่วนนี้</p>}
              {saSteps.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ตั้งแต่ปีที่</label>
                    <input type="number" value={s.startYear} onChange={(e)=>updateSaStepRow(s.id, 'startYear', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="1" />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ถึงปีที่</label>
                    <input type="number" value={s.endYear} onChange={(e)=>updateSaStepRow(s.id, 'endYear', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="15" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">เพิ่มเป็น (%)</label>
                    <input type="number" value={s.percent} onChange={(e)=>updateSaStepRow(s.id, 'percent', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="150" />
                  </div>
                  <div className="col-span-1 pb-1">
                    <button type="button" onClick={()=>removeSaStepRow(s.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-[#0B162C] border-b pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><Percent size={18} className="text-[#D4AF37]"/> รับเงินคืนระหว่างสัญญา (การันตี)</span>
                <button type="button" onClick={addReturnRow} className="text-xs bg-[#0B162C] text-[#D4AF37] px-2 py-1 rounded flex items-center gap-1 hover:bg-[#152238] transition shadow-sm">
                  <Plus size={14}/> เพิ่มช่วงปี
                </button>
              </h4>
              {returns.map((r, index) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">ตั้งแต่สิ้นปี</label>
                    <input type="number" value={r.startYear} onChange={(e)=>updateReturnRow(r.id, 'startYear', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="1" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">ถึงสิ้นปี</label>
                    <input type="number" value={r.endYear} onChange={(e)=>updateReturnRow(r.id, 'endYear', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="15" />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนเงิน/ปี (บาท)</label>
                    <input type="number" value={r.amount} onChange={(e)=>updateReturnRow(r.id, 'amount', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="0" />
                  </div>
                  <div className="col-span-1 pb-1">
                    {returns.length > 1 && (
                      <button type="button" onClick={()=>removeReturnRow(r.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition"><Trash2 size={14}/></button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t mt-3">
                <label className="block text-sm font-bold text-[#0B162C] mb-1">รับเงินก้อนเมื่อครบกำหนดสัญญา (บาท)</label>
                <input type="number" value={maturityBenefit} onChange={(e)=>setMaturityBenefit(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37]" placeholder="จำนวนเงินครบกำหนด (ไม่รวมปันผล)" />
              </div>
            </div>

            {productType === 'par' && (
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-2 flex justify-between items-center">
                  รับเงินปันผลตามประกาศ (ไม่การันตี)
                  <button type="button" onClick={addDividendRow} disabled={dividends.length >= 3} className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                    <Plus size={14}/> เพิ่มปันผล (สูงสุด 3)
                  </button>
                </h4>
                {dividends.length === 0 && <p className="text-xs text-slate-500">กดปุ่มเพิ่มเพื่อระบุเป้าหมายเงินปันผล</p>}
                {dividends.map((d, index) => (
                  <div key={d.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <label className="block text-xs font-bold text-slate-500 mb-1">รับสิ้นปีที่</label>
                      <input type="number" value={d.year} onChange={(e)=>updateDividendRow(d.id, 'year', e.target.value)} className="w-full p-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น 15" />
                    </div>
                    <div className="col-span-6">
                      <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนเงิน (บาท)</label>
                      <input type="number" value={d.amount} onChange={(e)=>updateDividendRow(d.id, 'amount', e.target.value)} className="w-full p-2 border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                    </div>
                    <div className="col-span-1 pb-1">
                      <button type="button" onClick={()=>removeDividendRow(d.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-white border border-red-100 rounded-lg transition"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-[#0B162C] border-b pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><TrendingUp size={18} className="text-[#D4AF37]"/> เน้นมูลค่าเวนคืนรายปี</span>
                <button type="button" onClick={addSurrenderRow} className="text-xs bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-100 transition shadow-sm">
                  <Plus size={14}/> เพิ่มปี
                </button>
              </h4>
              {surrenderValues.length === 0 && <p className="text-xs text-slate-500">กรอกข้อมูลมูลค่าเวนคืนในแต่ละปีเพื่อให้ลูกค้าเห็นจุดคุ้มทุน</p>}
              {surrenderValues.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">สิ้นปีที่</label>
                    <input type="number" value={s.year} onChange={(e)=>updateSurrenderRow(s.id, 'year', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="เช่น 10" />
                  </div>
                  <div className="col-span-6">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">มูลค่าเวนคืน (บาท)</label>
                    <input type="number" value={s.amount} onChange={(e)=>updateSurrenderRow(s.id, 'amount', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-1 focus:ring-[#D4AF37] text-sm" placeholder="0" />
                  </div>
                  <div className="col-span-1 pb-1">
                    <button type="button" onClick={()=>removeSurrenderRow(s.id)} className="p-1.5 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full py-4 bg-[#0B162C] text-[#D4AF37] rounded-xl font-bold text-lg hover:bg-[#152238] shadow-lg shadow-[#0B162C]/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <Calculator size={24} /> คำนวณและสร้างใบเสนอขาย
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-8 space-y-6">
            <h4 className="font-bold text-xl text-[#0B162C] mb-2">สรุปข้อเสนอ</h4>
            
            {!calcResult ? (
              <div className="h-64 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <Calculator size={48} className="mb-2 opacity-50 text-[#D4AF37]" />
                <p className="font-medium text-[#0B162C]">กรอกข้อมูลด้านซ้ายให้ครบถ้วน</p>
                <p className="text-sm text-slate-500">แล้วกดคำนวณเพื่อดูสรุปข้อเสนอ</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col border-b border-slate-100 pb-3">
                    <span className="text-slate-600 font-bold text-sm mb-1">รวมเงินต้นที่ออม</span>
                    <span className="text-2xl font-bold text-red-600">{calcResult.totalPaid.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-100 pb-3">
                    <div className="flex flex-col mb-1">
                      <span className="text-slate-600 font-bold text-sm leading-tight">รวมรับผลประโยชน์ตลอดสัญญา</span>
                      {productType === 'par' && <span className="text-[10px] text-slate-400 mt-0.5">(การันตี {calcResult.totalGuaranteedRecv.toLocaleString()} + ปันผล {calcResult.totalDividendRecv.toLocaleString()})</span>}
                    </div>
                    <span className="text-2xl font-black text-green-600">{calcResult.totalRecv.toLocaleString()} ฿</span>
                  </div>
                  <div className="pt-1 flex flex-col items-center text-center">
                    <span className="text-slate-600 font-bold text-sm mb-1">กำไรสุทธิ</span>
                    <span className="text-4xl font-black text-[#D4AF37]">{calcResult.netProfit.toLocaleString()} ฿</span>
                    <span className="bg-[#D4AF37] text-[#0B162C] px-4 py-1.5 rounded-lg text-sm font-bold mt-2 shadow-sm inline-block">
                      คิดเป็น +{calcResult.profitPercent}% ของเงินต้น
                    </span>
                  </div>
                </div>

                {productType === 'traditional' ? (
                   <div className="bg-[#0B162C] p-6 rounded-2xl text-center shadow-lg border border-[#D4AF37]/30 relative overflow-hidden flex flex-col items-center">
                     <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#D4AF37] opacity-10 rounded-full blur-2xl"></div>
                     <p className="text-[#D4AF37] font-bold text-sm mb-1 relative z-10">ผลตอบแทนเฉลี่ย (IRR)</p>
                     <div className="text-6xl font-black text-white relative z-10">{calcResult.irrGuaranteed}%</div>
                     <div className="mt-4 w-full bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative z-10 flex flex-col items-center">
                        <p className="text-slate-300 text-xs mb-1">เทียบเท่าดอกเบี้ยเงินฝากธนาคาร</p>
                        <p className="text-4xl font-black text-[#D4AF37] leading-tight mt-1">{calcResult.bankEqGuaranteed}%</p>
                        <p className="text-slate-400 text-[10px] mt-1">(ก่อนหักภาษี 15%)</p>
                     </div>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 gap-3">
                     <div className="bg-[#0B162C] p-6 rounded-2xl text-center shadow-lg border border-[#D4AF37]/30 relative overflow-hidden flex flex-col items-center">
                       <p className="text-[#D4AF37] font-bold text-sm mb-1 relative z-10 flex justify-center items-center gap-1">⭐ IRR (คาดหวังรวมปันผล)</p>
                       <div className="text-5xl font-black text-white relative z-10">{calcResult.irrTotal}%</div>
                       <div className="mt-4 w-full bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative z-10 flex flex-col items-center">
                          <p className="text-slate-300 text-xs mb-1">เทียบเท่าดอกเบี้ยเงินฝากธนาคาร</p>
                          <p className="text-4xl font-black text-[#D4AF37] leading-tight mt-1">{calcResult.bankEqTotal}%</p>
                          <p className="text-slate-400 text-[10px] mt-1">(ก่อนหักภาษี 15%)</p>
                       </div>
                     </div>
                     <div className="bg-white border border-slate-200 p-5 rounded-2xl text-center shadow-sm flex flex-col items-center">
                       <p className="text-slate-500 font-bold text-xs mb-1">IRR (เฉพาะการันตีผล)</p>
                       <div className="text-3xl font-black text-[#0B162C]">{calcResult.irrGuaranteed}%</div>
                       <div className="mt-3 w-full bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col items-center">
                         <p className="text-xs text-slate-500 font-medium">เทียบเท่าดอกเบี้ยเงินฝากธนาคาร</p>
                         <p className="text-xl font-bold text-slate-700 leading-none mt-2">{calcResult.bankEqGuaranteed}%</p>
                         <p className="text-[9px] text-slate-400 mt-1">(ก่อนหักภาษี 15%)</p>
                       </div>
                     </div>
                   </div>
                )}

                <button 
                  onClick={handleOpenExportConfig} 
                  className="w-full mt-4 py-3 bg-[#D4AF37] text-[#0B162C] rounded-xl font-bold hover:bg-[#C5A059] shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Share2 size={18}/> จัดเตรียมหน้าเอกสารเสนอขาย
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {exportStep === 'config' && (
        <div className="fixed inset-0 bg-[#0B162C]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
             <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-[#FDFBF7]">
               <h3 className="font-bold text-[#0B162C] text-lg flex items-center gap-2">
                 <Settings size={20} className="text-[#D4AF37]"/> ตั้งค่าการแชร์ใบเสนอขาย
               </h3>
               <button onClick={() => setExportStep('none')} className="text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm"><X size={20}/></button>
             </div>
             <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">รูปแบบการแชร์</label>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setIncludeTable(false)} className={`p-3 rounded-xl border text-sm font-bold transition-all ${!includeTable ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>เฉพาะหน้าสรุป</button>
                    <button onClick={() => setIncludeTable(true)} className={`p-3 rounded-xl border text-sm font-bold transition-all ${includeTable ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>สรุป + ตารางรายละเอียด</button>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">ขนาดกระดาษ (Layout)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setExportFormat('4:5')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === '4:5' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>ภาพ (4:5)</button>
                    <button onClick={() => setExportFormat('A4')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${exportFormat === 'A4' ? 'border-[#D4AF37] bg-[#FDFBF7] text-[#0B162C] shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>ขนาด A4</button>
                  </div>
                </div>
             </div>
             <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
                <button onClick={() => setExportStep('none')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition">ยกเลิก</button>
                <button onClick={handleConfirmConfigAndGenerate} className="flex-1 py-3 bg-[#0B162C] text-[#D4AF37] font-bold rounded-xl hover:bg-[#152238] shadow-md transition transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                  <ImageIcon size={18}/> สร้างภาพตัวอย่าง
                </button>
             </div>
          </div>
        </div>
      )}

      {(exportStep === 'preview' || exportStep === 'config') && (
        <div className="fixed top-0 left-[-9999px] z-[-1] pointer-events-none opacity-0">
           <div id="hidden-proposal-node" className="flex flex-col gap-0 shadow-2xl">
               <div className={`print-page bg-white relative overflow-hidden shrink-0 flex flex-col ${exportFormat === '4:5' ? 'w-[800px] h-[1000px]' : 'w-[794px] h-[1123px]'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 z-0"></div>
                  <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none z-0"></div>
                  <div className="absolute bottom-[-5%] right-[-5%] text-[#F8FAFC] pointer-events-none z-0"><Shield size={450} /></div>
                  
                  <div className={`relative z-10 flex flex-col h-full ${exportFormat === '4:5' ? 'p-8' : 'p-10'}`}>
                     <div className={`flex justify-between items-center border-b-2 border-[#D4AF37] ${exportFormat === '4:5' ? 'mb-5 pb-3' : 'mb-6 pb-4'}`}>
                       <div>
                          <h2 className={`font-black text-[#0B162C] uppercase tracking-tighter ${exportFormat === '4:5' ? 'text-3xl' : 'text-4xl'}`} style={{ lineHeight: 1 }}>FINANCIAL PROPOSAL</h2>
                          <h3 className={`font-bold text-[#D4AF37] uppercase tracking-widest ${exportFormat === '4:5' ? 'text-base mt-1.5' : 'text-lg mt-2'}`}>Wealth & Protection Plan</h3>
                       </div>
                       <div className={`bg-[#0B162C] rounded-xl flex items-center justify-center shadow-md ${exportFormat === '4:5' ? 'w-16 h-16 p-2' : 'w-20 h-20 p-3'}`}>
                          <img src="LOGO%20TEAM%2035.jpg" alt="Logo" className="w-full h-full object-contain" />
                       </div>
                     </div>

                     <div className={`grid grid-cols-2 gap-4 ${exportFormat === '4:5' ? 'mb-5' : 'mb-6'}`}>
                        <div>
                          <p className={`font-bold text-slate-400 uppercase tracking-widest ${exportFormat === '4:5' ? 'text-xs mb-1' : 'text-sm mb-1'}`}>Presented To</p>
                          <p className={`font-bold text-[#0B162C] ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{customerName || 'ผู้มุ่งหวังคนสำคัญ'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-slate-400 uppercase tracking-widest ${exportFormat === '4:5' ? 'text-xs mb-1' : 'text-sm mb-1'}`}>Plan Name</p>
                          <p className={`font-bold text-[#D4AF37] ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{planName || `สะสมทรัพย์ ${policyYears}/${payYears}`}</p>
                        </div>
                     </div>

                     <div className={`grid grid-cols-3 gap-3 ${exportFormat === '4:5' ? 'mb-5' : 'mb-6'}`}>
                       <div className={`bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-sm flex flex-col justify-center items-center ${exportFormat === '4:5' ? 'h-24' : 'h-28'}`}>
                         <p className={`text-slate-500 font-bold ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>ออมปีละ (บ.)</p>
                         <p className={`font-black text-[#0B162C] mt-1.5 ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{(Number(premium) || 0).toLocaleString()}</p>
                       </div>
                       <div className={`bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-sm flex flex-col justify-center items-center ${exportFormat === '4:5' ? 'h-24' : 'h-28'}`}>
                         <p className={`text-slate-500 font-bold ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>ชำระเบี้ย (ปี)</p>
                         <p className={`font-black text-[#0B162C] mt-1.5 ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{payYears || '-'}</p>
                       </div>
                       <div className={`bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-sm flex flex-col justify-center items-center ${exportFormat === '4:5' ? 'h-24' : 'h-28'}`}>
                         <p className={`text-slate-500 font-bold ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>คุ้มครอง (ปี)</p>
                         <p className={`font-black text-[#0B162C] mt-1.5 ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{policyYears || '-'}</p>
                       </div>
                     </div>

                     <div className={`bg-[#0B162C] rounded-3xl text-white shadow-xl border border-[#D4AF37]/30 flex flex-col ${exportFormat === '4:5' ? 'mb-5 p-6' : 'mb-6 p-8'}`}>
                        <div className={`flex justify-between border-b border-slate-700/80 ${exportFormat === '4:5' ? 'pb-4 mb-4' : 'pb-5 mb-5'}`}>
                          <div className="w-1/2 pr-2">
                            <p className={`text-slate-300 font-medium ${exportFormat === '4:5' ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>รวมเงินต้นที่ออมตลอดสัญญา</p>
                            <p className={`font-bold text-[#F8FAFC] ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{calcResult.totalPaid.toLocaleString()} ฿</p>
                          </div>
                          <div className="w-1/2 pl-2 text-right">
                            <p className={`text-slate-300 font-medium ${exportFormat === '4:5' ? 'mb-1 text-xs' : 'mb-2 text-sm'}`}>รวมผลประโยชน์รับกลับ</p>
                            <p className={`font-black text-[#D4AF37] ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>{calcResult.totalRecv.toLocaleString()} ฿</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-start">
                          <div className="w-1/2 pr-2 flex flex-col items-start">
                            <p className={`text-slate-300 font-bold ${exportFormat === '4:5' ? 'mb-1 text-sm' : 'mb-2 text-base'}`}>กำไรสุทธิ</p>
                            <p className={`font-black text-white ${exportFormat === '4:5' ? 'text-3xl' : 'text-4xl'}`}>{calcResult.netProfit.toLocaleString()} ฿</p>
                            <div className={`bg-[#D4AF37] text-[#0B162C] rounded-lg font-black shadow-md inline-block ${exportFormat === '4:5' ? 'px-3 py-1.5 text-xs mt-3' : 'px-4 py-2 text-sm mt-4'}`}>
                              +{calcResult.profitPercent}% ของเงินต้น
                            </div>
                          </div>
                          <div className="w-1/2 pl-2 flex flex-col items-end">
                            <p className={`text-[#D4AF37] font-bold ${exportFormat === '4:5' ? 'mb-1 text-sm' : 'mb-2 text-base'}`}>IRR {productType === 'par' ? '(รวมปันผล)' : ''}</p>
                            <p className={`font-black text-white ${exportFormat === '4:5' ? 'text-4xl' : 'text-5xl'}`}>{productType === 'par' ? calcResult.irrTotal : calcResult.irrGuaranteed}%</p>
                            
                            <div className={`bg-slate-800/80 border border-slate-600 rounded-xl flex items-center gap-3 text-left ${exportFormat === '4:5' ? 'p-2.5 mt-3' : 'p-3 mt-4'}`}>
                               <div className="flex flex-col">
                                 <span className={`text-slate-300 font-medium leading-tight ${exportFormat === '4:5' ? 'text-[9px]' : 'text-[10px]'}`}>เทียบเท่าดอกเบี้ย<br/>เงินฝากธนาคาร</span>
                                 <span className={`text-slate-400 font-medium ${exportFormat === '4:5' ? 'text-[7px] mt-0.5' : 'text-[8px] mt-1'}`}>(ก่อนหักภาษี 15%)</span>
                               </div>
                               <div className={`font-black text-[#D4AF37] ${exportFormat === '4:5' ? 'text-xl' : 'text-2xl'}`}>
                                  {productType === 'par' ? calcResult.bankEqTotal : calcResult.bankEqGuaranteed}%
                               </div>
                            </div>
                          </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 flex-1">
                       <div className={`bg-white border border-[#E2E8F0] rounded-xl flex flex-col relative overflow-hidden shadow-sm ${exportFormat === '4:5' ? 'p-5' : 'p-6'}`}>
                         <h5 className={`font-bold text-[#0B162C] border-b border-[#E2E8F0] flex items-center gap-2 ${exportFormat === '4:5' ? 'mb-3 pb-2 text-base' : 'mb-4 pb-3 text-lg'}`}><Shield size={18} className="text-[#D4AF37]"/> ทุนคุ้มครองชีวิต</h5>
                         <div className={`flex justify-between text-slate-600 ${exportFormat === '4:5' ? 'mb-3 text-sm' : 'mb-4 text-base'}`}>
                           <span>เริ่มต้น:</span>
                           <span className="font-bold text-[#0B162C]">{(Number(initialSumAssured) || 0).toLocaleString()} ฿</span>
                         </div>
                         {saSteps.length > 0 && (
                           <div className="mt-2 flex-1">
                             <p className={`font-medium text-slate-400 border-b border-dashed border-[#E2E8F0] ${exportFormat === '4:5' ? 'mb-2 pb-1.5 text-xs' : 'mb-3 pb-2 text-sm'}`}>ระยะเวลาที่ปรับทุนเพิ่ม</p>
                             <ul className={`${exportFormat === '4:5' ? 'space-y-2' : 'space-y-3'}`}>
                               {saSteps.sort((a,b)=>a.startYear - b.startYear).map((s, idx) => {
                                 const calculatedSA = (Number(initialSumAssured) || 0) * (Number(s.percent) || 0) / 100;
                                 return (
                                   <li key={idx} className={`flex justify-between items-center text-slate-700 border-b border-slate-50 ${exportFormat === '4:5' ? 'pb-1.5' : 'pb-2'}`}>
                                     <span className={`font-medium ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>ปีที่ {s.startYear}-{s.endYear}</span>
                                     <div className="text-right flex flex-col items-end leading-tight">
                                       <span className={`font-bold text-[#D4AF37] ${exportFormat === '4:5' ? 'text-base' : 'text-lg'}`}>{calculatedSA.toLocaleString()} ฿</span>
                                       <span className={`text-slate-400 font-medium ${exportFormat === '4:5' ? 'text-[9px]' : 'text-[10px]'}`}>({s.percent}%)</span>
                                     </div>
                                   </li>
                                 )
                               })}
                             </ul>
                           </div>
                         )}
                       </div>

                       <div className={`bg-white border border-[#E2E8F0] rounded-xl flex flex-col relative overflow-hidden shadow-sm ${exportFormat === '4:5' ? 'p-5' : 'p-6'}`}>
                         <h5 className={`font-bold text-[#0B162C] border-b border-[#E2E8F0] flex items-center gap-2 ${exportFormat === '4:5' ? 'mb-3 pb-2 text-base' : 'mb-4 pb-3 text-lg'}`}><TrendingUp size={18} className="text-[#D4AF37]"/> จุดคุ้มทุน (เวนคืน + เงินคืน)</h5>
                         {calcResult.surrenderDisplayData && calcResult.surrenderDisplayData.length > 0 ? (
                           <ul className={`mt-1 flex-1 ${exportFormat === '4:5' ? 'space-y-2' : 'space-y-3'}`}>
                             {calcResult.surrenderDisplayData.sort((a,b)=>a.year - b.year).map((s, idx) => (
                               <li key={idx} className={`flex flex-col border-b border-[#F8FAFC] ${exportFormat === '4:5' ? 'pb-2' : 'pb-3'}`}>
                                 <div className="flex justify-between items-center mb-1.5">
                                   <span className={`text-slate-700 font-bold ${exportFormat === '4:5' ? 'text-sm' : 'text-base'}`}>สิ้นปีที่ {s.year}</span>
                                   <span className={`font-black text-[#0B162C] ${exportFormat === '4:5' ? 'text-base' : 'text-lg'}`}>{s.totalValue.toLocaleString()} ฿</span>
                                 </div>
                                 <div className={`flex justify-between text-slate-500 font-medium bg-[#F8FAFC] rounded-md ${exportFormat === '4:5' ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-xs'}`}>
                                   <span>เวนคืน: {s.surrenderAmount.toLocaleString()}</span>
                                   <span>รับสะสม: {(s.cumulativeReturn + s.cumulativeDividend).toLocaleString()}</span>
                                 </div>
                               </li>
                             ))}
                           </ul>
                         ) : (
                           <div className={`flex-1 flex items-center justify-center text-slate-400 italic text-center ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>ไม่มีข้อมูลเวนคืนที่ระบุ</div>
                         )}
                       </div>
                     </div>

                     <div className={`border-t-2 border-[#E2E8F0] mt-auto flex justify-between items-end ${exportFormat === '4:5' ? 'pt-4' : 'pt-5'}`}>
                        <div className={`font-bold bg-[#FDFBF7] rounded-xl text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center leading-none ${exportFormat === '4:5' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'}`}>
                          <span className="pb-0.5">35 DA&K Hub</span>
                        </div>
                        <div className={`text-right font-medium text-slate-500 flex flex-col gap-0.5 ${exportFormat === '4:5' ? 'text-[9px]' : 'text-xs'}`}>
                          <span>Proposal Generated by <strong className="text-[#0B162C]">{user?.name}</strong></span>
                          <span>{timestamp}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {includeTable && tablePages.map((pageChunk, pageIndex) => (
                 <div key={`table-page-${pageIndex}`} className={`print-page bg-white relative overflow-hidden flex flex-col shrink-0 mx-auto ${exportFormat === '4:5' ? 'w-[800px] h-[1000px]' : 'w-[794px] h-[1123px]'}`}>
                    <div className={`relative z-10 flex flex-col h-full ${exportFormat === '4:5' ? 'p-10' : 'p-12'}`}>
                      <div className={`flex justify-between items-end border-b-2 border-[#E2E8F0] ${exportFormat === '4:5' ? 'mb-6 pb-4' : 'mb-8 pb-5'}`}>
                        <div>
                           <h3 className={`font-black text-[#0B162C] flex items-center gap-2 uppercase ${exportFormat === '4:5' ? 'text-2xl' : 'text-3xl'}`}>
                             <Table size={exportFormat === '4:5' ? 24 : 28} className="text-[#D4AF37]"/> ตารางรายละเอียดสรุป
                           </h3>
                           <span className={`text-slate-500 font-bold block ${exportFormat === '4:5' ? 'text-sm mt-2' : 'text-base mt-2'}`}>หน้า {pageIndex + 1}</span>
                        </div>
                        <div className="text-right">
                           <p className={`font-bold text-[#0B162C] ${exportFormat === '4:5' ? 'text-lg' : 'text-xl'}`}>{customerName}</p>
                           <p className={`text-[#D4AF37] font-bold mt-1 ${exportFormat === '4:5' ? 'text-sm' : 'text-base'}`}>{planName}</p>
                        </div>
                      </div>

                      <div className="flex-1 mt-2">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className={`bg-[#0B162C] text-white border-y-2 border-[#D4AF37] ${exportFormat === '4:5' ? 'text-xs' : 'text-sm'}`}>
                              <th className={`font-bold border-r border-[#1A2A44] ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'} w-16`}>ปีที่</th>
                              <th className={`font-bold border-r border-[#1A2A44] ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>เบี้ยประกัน</th>
                              <th className={`font-bold border-r border-[#1A2A44] ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>ทุนคุ้มครอง</th>
                              <th className={`font-bold border-r border-[#1A2A44] text-[#D4AF37] ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>เงินคืน</th>
                              {productType === 'par' && <th className={`font-bold border-r border-[#1A2A44] text-blue-300 ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>ปันผล</th>}
                              <th className={`font-bold border-r border-[#1A2A44] text-slate-300 ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>มูลค่าเวนคืน</th>
                              <th className={`font-bold bg-[#152238] text-green-400 ${exportFormat === '4:5' ? 'py-3' : 'py-3.5'}`}>รับคืนสะสม</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageChunk.map((row, idx) => (
                              <tr key={row.year} className={`border-b border-[#E2E8F0] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-slate-100 transition-colors ${exportFormat === '4:5' ? 'text-sm' : 'text-base'}`}>
                                <td className={`font-bold border-r border-[#E2E8F0] text-[#0B162C] ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.year}</td>
                                <td className={`border-r border-[#E2E8F0] text-slate-700 ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.premium > 0 ? row.premium.toLocaleString() : '-'}</td>
                                <td className={`font-bold border-r border-[#E2E8F0] text-red-600 ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.protection > 0 ? row.protection.toLocaleString() : '-'}</td>
                                <td className={`border-r border-[#E2E8F0] font-bold text-[#D4AF37] ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.guaranteedReturn > 0 ? row.guaranteedReturn.toLocaleString() : '-'}</td>
                                {productType === 'par' && <td className={`border-r border-[#E2E8F0] text-blue-600 ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.dividend > 0 ? row.dividend.toLocaleString() : '-'}</td>}
                                <td className={`font-bold border-r border-[#E2E8F0] text-blue-900 ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.surrenderValue > 0 ? row.surrenderValue.toLocaleString() : '-'}</td>
                                <td className={`font-bold text-green-700 ${exportFormat === '4:5' ? 'py-2' : 'py-3'}`}>{row.cumulativeReturn > 0 ? row.cumulativeReturn.toLocaleString() : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className={`border-t-2 border-[#E2E8F0] flex justify-between items-end font-medium text-slate-500 ${exportFormat === '4:5' ? 'mt-8 pt-6 text-xs' : 'mt-10 pt-8 text-sm'}`}>
                         <div className={`font-bold bg-[#FDFBF7] rounded-xl text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center leading-none ${exportFormat === '4:5' ? 'h-8 px-4' : 'h-10 px-5'}`}>
                            <span className="pb-0.5">35 DA&K Hub</span>
                         </div>
                         <span>{timestamp}</span>
                      </div>
                    </div>
                 </div>
               ))}
           </div>
        </div>
      )}

      {exportStep === 'preview' && (
        <div className="fixed inset-0 bg-[#0B162C]/90 z-[100] flex items-center justify-center p-0 md:p-4 backdrop-blur-sm">
          <div className="bg-slate-50 md:rounded-2xl w-full max-w-[95vw] shadow-2xl border-t-4 border-[#D4AF37] overflow-hidden flex flex-col h-full max-h-[100vh] md:max-h-[95vh] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10 shrink-0">
              <h3 className="font-bold text-[#0B162C] text-lg flex items-center gap-2"><Share2 className="text-[#D4AF37]"/> ภาพตัวอย่างพร้อมแชร์</h3>
              <button onClick={() => setExportStep('none')} className="text-slate-400 hover:text-red-500 bg-slate-100 rounded-full p-1 transition"><X size={24}/></button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="w-full md:w-72 bg-white p-5 border-r border-slate-200 flex flex-col gap-4 overflow-y-auto shrink-0">
                <button 
                  onClick={() => setExportStep('config')} 
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition mb-4"
                >
                  <Edit size={18}/> กลับไปตั้งค่า
                </button>
                
                <div className="space-y-3 mt-auto pt-6 border-t border-slate-200">
                  <button 
                    onClick={handleDownloadImage} 
                    disabled={isGenerating}
                    className="w-full py-3 bg-[#0B162C] text-[#D4AF37] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#152238] transition shadow-md disabled:opacity-50"
                  >
                     <Download size={18}/> บันทึกเป็นรูปภาพ
                  </button>
                  <button 
                    onClick={handlePrint} 
                    disabled={isGenerating}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                  >
                     <Printer size={18}/> แชร์เป็น PDF / A4
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-300 p-4 md:p-8 overflow-auto flex items-start justify-center w-full relative">
                {isGenerating ? (
                   <div className="flex flex-col items-center justify-center h-full text-[#0B162C]">
                      <Loader2 className="animate-spin mb-4 text-[#D4AF37]" size={40}/>
                      <p className="font-bold text-lg">กำลังประมวลผลภาพ...</p>
                      <p className="text-sm text-slate-500">กรุณารอสักครู่</p>
                   </div>
                ) : (
                   previewImageUrl && (
                      <div className="w-full flex justify-center pb-10">
                         <img 
                           src={previewImageUrl} 
                           alt="Preview" 
                           className="shadow-2xl object-contain h-max"
                           style={{ 
                             maxWidth: '100%', 
                             maxHeight: '85vh',
                             width: 'auto' 
                           }} 
                         />
                      </div>
                   )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageToTool({ toolName, resultType }) {
  const [step, setStep] = useState('upload'); 
  const fileInputRef = useRef(null);

  const handleSimulateUpload = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      setStep('processing');
      setTimeout(() => {
        setStep('result');
      }, 2500);
    }
  };

  const reset = () => setStep('upload');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-[#0B162C]">{toolName}</h3>
         {step === 'result' && <button onClick={reset} className="text-sm text-[#D4AF37] font-bold hover:underline">เริ่มใหม่</button>}
      </div>

      {step === 'upload' && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#D4AF37]/50 rounded-2xl p-12 text-center cursor-pointer hover:bg-[#FDFBF7] transition-colors flex flex-col items-center justify-center min-h-[300px]"
        >
          <UploadCloud className="w-16 h-16 text-[#D4AF37] mb-4" />
          <h4 className="text-lg font-bold text-[#0B162C] mb-2">อัปโหลดภาพตารางแบบประกัน</h4>
          <p className="text-slate-500 text-sm max-w-sm">
            แนบภาพที่แคปเจอร์หน้าจอแบบประกัน ระบบจะดึงข้อมูลมาสร้างเป็นตารางนำเสนอแบบปิดการขายให้อัตโนมัติ
          </p>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleSimulateUpload} accept="image/*" />
          <button className="mt-6 bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#152238] transition transform hover:-translate-y-0.5">
            เลือกรูปภาพ
          </button>
        </div>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
           <div className="w-16 h-16 border-4 border-[#FDFBF7] border-t-[#D4AF37] rounded-full animate-spin"></div>
           <p className="text-[#0B162C] font-bold animate-pulse text-lg">กำลังวิเคราะห์ข้อมูลจากภาพ...</p>
           <p className="text-slate-500 text-sm">ดึงข้อมูลเบี้ยประกัน ทุนประกัน และผลประโยชน์</p>
        </div>
      )}

      {step === 'result' && (
        <div className="animate-in fade-in duration-500">
           {resultType === 'irr' && <MockIRRResult />}
           {resultType === 'savings' && <MockSavingsResult />}
           {resultType === 'income' && <MockIncomeResult />}
           {resultType === 'legacy' && <MockLegacyResult />}
        </div>
      )}
    </div>
  );
}

function MockIRRResult() {
  return (
    <div className="space-y-6">
      <div className="bg-[#FDFBF7] border border-[#D4AF37]/30 text-[#0B162C] p-4 rounded-lg flex items-start gap-3">
        <CheckCircle className="shrink-0 mt-0.5 text-[#D4AF37]" />
        <div>
          <p className="font-bold">ดึงข้อมูลสำเร็จ</p>
          <p className="text-sm text-slate-600">แบบประกัน: สะสมทรัพย์ 15/5 (ชำระเบี้ย 5 ปี คุ้มครอง 15 ปี)</p>
        </div>
      </div>
      
      <div className="text-center p-8 border border-slate-200 rounded-2xl bg-white shadow-sm">
        <p className="text-slate-500 font-medium mb-2">ผลตอบแทนเฉลี่ย (IRR)</p>
        <div className="text-6xl font-black text-[#0B162C] mb-4">2.85%</div>
        <p className="text-sm font-medium text-[#D4AF37]">เทียบเท่าเงินฝากประจำ 3.35% (ก่อนหักภาษี)</p>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition">แก้ไขข้อมูล</button>
        <button className="px-6 py-2 bg-[#D4AF37] text-[#0B162C] rounded-lg hover:bg-[#C5A059] font-bold flex items-center gap-2 shadow-md shadow-[#D4AF37]/20 transition"><FileText size={18}/> สร้าง PDF นำเสนอ</button>
      </div>
    </div>
  );
}

function MockSavingsResult() {
  return (
    <div className="space-y-4">
      <p className="font-bold text-[#0B162C] text-lg mb-4 border-l-4 border-[#D4AF37] pl-3">สรุปแผนการออมเงิน (แบบเข้าใจง่าย)</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#0B162C] text-[#D4AF37]">
              <th className="p-4 font-bold">รายการ</th>
              <th className="p-4 text-right font-bold">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="bg-white"><td className="p-4 font-medium text-slate-700">เงินออมต่อปี</td><td className="p-4 text-right text-[#0B162C] font-bold">100,000</td></tr>
            <tr className="bg-white"><td className="p-4 font-medium text-slate-700">ระยะเวลาออม</td><td className="p-4 text-right text-[#0B162C] font-bold">5 ปี</td></tr>
            <tr className="bg-red-50/50"><td className="p-4 font-bold text-red-700">รวมเงินต้นที่ออม</td><td className="p-4 text-right font-bold text-red-700">500,000</td></tr>
            <tr className="bg-white"><td className="p-4 font-medium text-slate-700">รับเงินคืนระหว่างสัญญา (ปีละ 1%)</td><td className="p-4 text-right text-[#0B162C]">5,000 x 15 ปี = 75,000</td></tr>
            <tr className="bg-white"><td className="p-4 font-medium text-slate-700">รับเงินก้อนครบสัญญา</td><td className="p-4 text-right text-[#0B162C]">520,000</td></tr>
            <tr className="bg-[#FDFBF7]"><td className="p-4 font-bold text-[#D4AF37]">รวมรับผลประโยชน์ทั้งหมด</td><td className="p-4 text-right font-bold text-[#D4AF37]">595,000</td></tr>
            <tr className="bg-[#0B162C]"><td className="p-4 font-bold text-white">กำไรสุทธิ</td><td className="p-4 text-right font-bold text-[#D4AF37]">95,000</td></tr>
          </tbody>
        </table>
      </div>
      <button className="w-full mt-6 py-4 bg-[#D4AF37] text-[#0B162C] rounded-xl font-bold hover:bg-[#C5A059] shadow-lg shadow-[#D4AF37]/20 transition transform hover:-translate-y-0.5">บันทึกเป็นรูปภาพสำหรับส่งให้ลูกค้า</button>
    </div>
  );
}

function MockIncomeResult() {
  return (
    <div className="space-y-6 text-center">
       <div className="p-8 bg-[#FDFBF7] rounded-2xl border border-[#D4AF37]/40 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-10 rounded-bl-full"></div>
         <h4 className="font-bold text-[#0B162C] mb-2 text-lg relative z-10">แผนชดเชยรายได้รายวัน (HB)</h4>
         <div className="text-4xl font-black text-[#D4AF37] my-4 drop-shadow-sm relative z-10">3,000 <span className="text-2xl font-bold text-[#0B162C]">บาท / วัน</span></div>
         <p className="text-sm font-medium text-slate-500 relative z-10 bg-white inline-block px-4 py-1 rounded-full border border-slate-200">เบี้ยประกันเพียง 15 บาท / วัน</p>
       </div>
       <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left inline-block w-full max-w-md shadow-sm">
         <ul className="space-y-4">
           <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-[#D4AF37]" size={20} /> เจ็บป่วยนอน รพ. รับวันละ 3,000 บ.</li>
           <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-[#D4AF37]" size={20} /> ผ่าตัดใหญ่/ไอซียู รับวันละ 6,000 บ.</li>
           <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle className="text-[#D4AF37]" size={20} /> คุ้มครองยาวนานถึงอายุ 85 ปี</li>
         </ul>
       </div>
    </div>
  );
}

function MockLegacyResult() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
          <p className="text-slate-500 font-medium mb-1">เบี้ยประกันที่จ่าย</p>
          <p className="text-3xl font-bold text-[#0B162C]">50,000 <span className="text-lg">บ./ปี</span></p>
          <p className="text-sm text-slate-400 mt-2">จ่าย 20 ปี รวม 1 ล้านบาท</p>
        </div>
        <div className="bg-[#0B162C] p-6 rounded-2xl shadow-lg text-center text-[#D4AF37] relative overflow-hidden border border-[#D4AF37]/30">
          <div className="absolute -right-4 -top-4 opacity-10 text-white"><Shield size={100} /></div>
          <p className="text-slate-300 mb-2 relative z-10 font-medium">กองทุนมรดกส่งมอบให้ครอบครัว</p>
          <p className="text-4xl font-black relative z-10 drop-shadow-md">5,000,000 <span className="text-2xl font-bold">บาท</span></p>
          <p className="text-sm text-[#D4AF37]/80 mt-3 relative z-10 bg-[#152238] inline-block px-3 py-1 rounded-full">ตั้งแต่เริ่มอนุมัติกรมธรรม์</p>
        </div>
      </div>
      <div className="bg-[#FDFBF7] p-5 rounded-xl text-sm text-[#0B162C] border border-[#D4AF37]/20 shadow-sm flex gap-3 items-start">
        <Shield className="text-[#D4AF37] shrink-0" size={20} />
        <p><strong>จุดขาย:</strong> ใช้เงินก้อนเล็ก (หลักหมื่น) สร้างเงินก้อนใหญ่ (หลักล้าน) ทันที การันตีส่งมอบมรดกให้คนที่คุณรัก ไม่ต้องเสียภาษีมรดก</p>
      </div>
    </div>
  );
}

function HealthPresentation() {
  const [plans, setPlans] = useState([
    { id: 1, name: 'แผนเริ่มต้น', room: '2,000', lumpSum: 'เหมาจ่าย 1 ล้าน', opd: '-', premium: '15,000' },
    { id: 2, name: 'แผนยอดฮิต', room: '4,000', lumpSum: 'เหมาจ่าย 5 ล้าน', opd: '1,000/ครั้ง', premium: '24,000' },
    { id: 3, name: 'แผน VIP', room: '8,000', lumpSum: 'เหมาจ่าย 15 ล้าน', opd: '2,000/ครั้ง', premium: '35,000' }
  ]);

  const addPlan = () => {
    if (plans.length < 5) {
      setPlans([...plans, { id: Date.now(), name: `แผนที่ ${plans.length + 1}`, room: '', lumpSum: '', opd: '', premium: '' }]);
    }
  };

  const removePlan = (id) => {
    if (plans.length > 3) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const updatePlan = (id, field, value) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#0B162C]">ตารางเปรียบเทียบประกันสุขภาพ</h3>
          <p className="text-sm text-slate-500 mt-1">เปรียบเทียบ 3-5 แผน เพื่อให้ลูกค้าตัดสินใจง่ายขึ้น</p>
        </div>
        <button 
          onClick={addPlan} 
          disabled={plans.length >= 5}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B162C] text-[#D4AF37] rounded-lg font-bold hover:bg-[#152238] shadow-md shadow-[#0B162C]/10 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> เพิ่มแผน
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b-2 border-slate-200 bg-[#FDFBF7] text-left w-48 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-[#0B162C] font-bold">ความคุ้มครอง</th>
              {plans.map((plan, index) => (
                <th key={plan.id} className="p-4 border-b-2 border-slate-200 text-center min-w-[150px] relative bg-white">
                  <input 
                    type="text" 
                    value={plan.name} 
                    onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
                    className="w-full text-center font-bold text-[#0B162C] bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-[#D4AF37] pb-1 transition-colors"
                  />
                  {plans.length > 3 && (
                    <button onClick={() => removePlan(plan.id)} className="absolute top-4 right-2 text-red-400 hover:text-red-600 bg-white rounded-full p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 bg-[#FDFBF7] font-medium text-slate-700 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">ค่าห้อง / วัน</td>
              {plans.map(plan => (
                <td key={plan.id} className="p-2">
                  <input type="text" value={plan.room} onChange={(e) => updatePlan(plan.id, 'room', e.target.value)} className="w-full text-center p-3 border border-transparent rounded-lg focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37] outline-none hover:bg-slate-50 focus:bg-white transition-all font-medium text-[#0B162C]" placeholder="เช่น 2,000" />
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 bg-[#FDFBF7] font-medium text-slate-700 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">ค่ารักษาเหมาจ่าย</td>
              {plans.map(plan => (
                <td key={plan.id} className="p-2">
                  <input type="text" value={plan.lumpSum} onChange={(e) => updatePlan(plan.id, 'lumpSum', e.target.value)} className="w-full text-center p-3 border border-transparent rounded-lg focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37] outline-none hover:bg-slate-50 focus:bg-white transition-all font-medium text-[#0B162C]" placeholder="เช่น เหมาจ่าย 1 ลบ." />
                </td>
              ))}
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 bg-[#FDFBF7] font-medium text-slate-700 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">ผู้ป่วยนอก (OPD)</td>
              {plans.map(plan => (
                <td key={plan.id} className="p-2">
                  <input type="text" value={plan.opd} onChange={(e) => updatePlan(plan.id, 'opd', e.target.value)} className="w-full text-center p-3 border border-transparent rounded-lg focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37] outline-none hover:bg-slate-50 focus:bg-white transition-all font-medium text-[#0B162C]" placeholder="เช่น 1,000/ครั้ง" />
                </td>
              ))}
            </tr>
            <tr className="bg-[#0B162C]">
              <td className="p-4 bg-[#0B162C] font-bold text-[#D4AF37] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.1)] rounded-bl-lg">เบี้ยประกันสุทธิ / ปี</td>
              {plans.map(plan => (
                <td key={plan.id} className="p-3">
                  <input type="text" value={plan.premium} onChange={(e) => updatePlan(plan.id, 'premium', e.target.value)} className="w-full text-center p-3 border border-[#D4AF37]/30 rounded-lg font-bold text-[#0B162C] focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white shadow-inner" placeholder="บาท" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="px-8 py-3 bg-[#D4AF37] text-[#0B162C] rounded-xl font-bold hover:bg-[#C5A059] shadow-lg shadow-[#D4AF37]/30 flex items-center gap-2 transition transform hover:-translate-y-0.5">
           <ImageIcon size={20} /> บันทึกเป็นรูปภาพตาราง
        </button>
      </div>
    </div>
  );
}

function AdminUsers({ users, setUsers, showConfirm }) {
  const handleDelete = (id) => {
    showConfirm('ต้องการลบสมาชิกนี้ออกจากระบบหรือไม่?', () => {
      setUsers(users.filter(u => u.id !== id));
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
        <h3 className="text-xl font-bold text-[#0B162C]">จัดการข้อมูลบัญชีสมาชิก</h3>
        <p className="text-sm text-slate-500 mt-1">ตั้งค่าผู้ใช้งานและการเข้าถึงระบบ (หากต้องการดูผลงานให้ไปที่แถบ "จัดการเป้าหมายเบี้ย & คุณวุฒิ")</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-600">ชื่อ-นามสกุล</th>
              <th className="p-4 font-bold text-slate-600">Username</th>
              <th className="p-4 font-bold text-slate-600">สิทธิ์</th>
              <th className="p-4 font-bold text-slate-600 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-[#0B162C]">{u.name}</td>
                <td className="p-4 text-slate-500">{u.username}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${u.role === 'admin' ? 'bg-[#0B162C] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#0B162C]'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 font-medium hover:underline text-sm disabled:opacity-30 transition-colors" disabled={u.role === 'admin'}>ลบผู้ใช้</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPerformance({ users, setUsers, qualifications, setQualifications, globalTargetFYP, setGlobalTargetFYP, showAlert, showConfirm }) {
  const [newQualName, setNewQualName] = useState('');
  const [newQualTarget, setNewQualTarget] = useState('');
  const [editingQual, setEditingQual] = useState(null);
  const [tempGlobalTarget, setTempGlobalTarget] = useState(globalTargetFYP);

  const [editingSpecialUser, setEditingSpecialUser] = useState(null);
  const [specialQualsList, setSpecialQualsList] = useState([]);
  const [newSpecialQualName, setNewSpecialQualName] = useState('');
  const [newSpecialQualTarget, setNewSpecialQualTarget] = useState('');

  const members = users.filter(u => u.role === 'member');

  const handleSaveGlobalTarget = () => {
    if(Number(tempGlobalTarget) <= 0) return showAlert('กรุณากรอกยอดเป้าหมายให้ถูกต้อง');
    setGlobalTargetFYP(Number(tempGlobalTarget));
    showAlert('อัปเดตเป้าหมายเบี้ยประกันส่วนกลางสำเร็จ');
  };

  const handleAddQual = () => {
    if (newQualName.trim() === '' || newQualTarget.toString().trim() === '') {
      showAlert('กรุณากรอกชื่อและเป้าหมายคุณวุฒิให้ครบถ้วน');
      return;
    }
    setQualifications([...qualifications, { id: Date.now(), name: newQualName, target: Number(newQualTarget) }]);
    setNewQualName('');
    setNewQualTarget('');
  };

  const handleRemoveQual = (id) => {
    showConfirm('ต้องการลบคุณวุฒินี้ใช่หรือไม่? (การเปลี่ยนแปลงจะมีผลกับตัวแทนทุกคน)', () => {
      setQualifications(qualifications.filter(q => q.id !== id));
    });
  };

  const handleSaveEditQual = (e) => {
    e.preventDefault();
    setQualifications(qualifications.map(q => q.id === editingQual.id ? editingQual : q));
    setEditingQual(null);
    showAlert('บันทึกการแก้ไขคุณวุฒิสำเร็จ');
  };

  const handleOpenSpecialQual = (user) => {
    setEditingSpecialUser(user);
    setSpecialQualsList(user.specialQualifications || []);
    setNewSpecialQualName('');
    setNewSpecialQualTarget('');
  };

  const handleAddSpecialQual = () => {
    if (newSpecialQualName.trim() === '' || newSpecialQualTarget.toString().trim() === '') {
      showAlert('กรุณากรอกชื่อและเป้าหมายคุณวุฒิพิเศษให้ครบถ้วน');
      return;
    }
    setSpecialQualsList([...specialQualsList, { id: Date.now(), name: newSpecialQualName, target: Number(newSpecialQualTarget) }]);
    setNewSpecialQualName('');
    setNewSpecialQualTarget('');
  };

  const handleRemoveSpecialQual = (id) => {
    showConfirm('ต้องการลบคุณวุฒิพิเศษนี้ใช่หรือไม่?', () => {
       setSpecialQualsList(specialQualsList.filter(q => q.id !== id));
    });
  };

  const handleSaveSpecialQuals = () => {
    setUsers(users.map(u => u.id === editingSpecialUser.id ? { ...u, specialQualifications: specialQualsList } : u));
    setEditingSpecialUser(null);
    showAlert('บันทึกคุณวุฒิพิเศษให้สมาชิกสำเร็จ');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
          <h3 className="text-xl font-bold text-[#0B162C] flex items-center gap-2"><TrendingUp className="text-[#D4AF37]"/> ตั้งค่าเป้าหมายเบี้ยประกันส่วนกลาง (FYP)</h3>
          <p className="text-sm text-slate-500 mt-1">เป้าหมายนี้จะถูกใช้เป็นเกณฑ์หลักในการคำนวณหลอดความคืบหน้าของตัวแทนทุกคน</p>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">เป้าหมายเบี้ยประกันรวมทั้งปี (บาท)</label>
            <input 
              type="number" 
              value={tempGlobalTarget}
              onChange={(e) => setTempGlobalTarget(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] text-lg font-bold text-[#0B162C]"
            />
          </div>
          <button onClick={handleSaveGlobalTarget} className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] shadow-sm transition flex items-center gap-2">
            <Save size={18}/> บันทึกเป้าหมาย
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
          <h3 className="text-xl font-bold text-[#0B162C] flex items-center gap-2"><Trophy className="text-[#D4AF37]"/> จัดการคุณวุฒิส่วนกลาง</h3>
          <p className="text-sm text-slate-500 mt-1">คุณวุฒิที่เพิ่มที่นี่ จะไปแสดงในหน้าจอติดตามผลงานของ "ตัวแทนทุกคน" อัตโนมัติ</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อคุณวุฒิ</label>
              <input 
                type="text" 
                value={newQualName}
                onChange={(e) => setNewQualName(e.target.value)}
                placeholder="เช่น ทริปสิงคโปร์, MDRT 2025"
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">เบี้ยเป้าหมาย (บาท)</label>
              <input 
                type="number" 
                value={newQualTarget}
                onChange={(e) => setNewQualTarget(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
              />
            </div>
            <div className="md:col-span-1">
              <button type="button" onClick={handleAddQual} className="w-full bg-[#0B162C] text-[#D4AF37] py-3 rounded-xl font-bold hover:bg-[#152238] shadow-sm transition flex justify-center items-center gap-2">
                <Plus size={18}/> เพิ่มคุณวุฒิ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualifications.map(qual => (
              <div key={qual.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#D4AF37]/50 transition">
                <div>
                  <span className="font-bold text-[#0B162C] block flex items-center gap-1.5"><Shield size={16} className="text-[#D4AF37]" /> {qual.name}</span>
                  <span className="text-sm text-slate-500 block mt-1">เป้าหมาย: {qual.target.toLocaleString()} ฿</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingQual(qual)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition"><Edit size={18}/></button>
                  <button onClick={() => handleRemoveQual(qual.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
            {qualifications.length === 0 && (
              <div className="col-span-full text-center py-6 text-slate-400 border-2 border-dashed rounded-xl">ยังไม่มีคุณวุฒิส่วนกลาง</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
          <h3 className="text-xl font-bold text-[#0B162C] flex items-center gap-2"><Users className="text-[#D4AF37]"/> ติดตามผลงานของตัวแทน</h3>
          <p className="text-sm text-slate-500 mt-1">สรุปยอดเบี้ยรวมและเปอร์เซ็นต์ความสำเร็จเทียบกับเป้าหมายส่วนกลาง ({globalTargetFYP.toLocaleString()} บาท)</p>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600 rounded-tl-lg">ชื่อตัวแทน</th>
                <th className="p-4 font-bold text-slate-600">เบี้ยนำส่งรวม (บาท)</th>
                <th className="p-4 font-bold text-slate-600">เบี้ยอนุมัติรวม (บาท)</th>
                <th className="p-4 font-bold text-[#0B162C] bg-[#FDFBF7]">เป้าหมายส่วนกลาง</th>
                <th className="p-4 font-bold text-slate-600 rounded-tr-lg">% สำเร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => {
                const totalSub = (member.performanceRecords || []).reduce((sum, r) => sum + r.submitted, 0);
                const totalApp = (member.performanceRecords || []).reduce((sum, r) => sum + r.approved, 0);
                const percent = globalTargetFYP > 0 ? Math.min((totalApp / globalTargetFYP) * 100, 100) : 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-[#0B162C]">{member.name}</td>
                    <td className="p-4 text-slate-600">{totalSub.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-bold">{totalApp.toLocaleString()}</td>
                    <td className="p-4 bg-[#FDFBF7] font-bold text-[#0B162C]">
                  {globalTargetFYP.toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 w-24">
                      <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-8">{Math.floor(percent)}%</span>
                  </div>
                  {totalApp >= globalTargetFYP && (
                    <button 
                      onClick={() => handleOpenSpecialQual(member)}
                      className="mt-2 w-full text-xs bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#0B162C] py-1.5 px-2 rounded-lg font-bold shadow-sm hover:shadow-md transition flex justify-center items-center gap-1"
                    >
                      ⭐ เพิ่มคุณวุฒิพิเศษ
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
              {members.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">ยังไม่มีตัวแทนในระบบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingQual && (
        <div className="fixed inset-0 bg-[#0B162C]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border-t-4 border-[#D4AF37] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-[#FDFBF7]">
              <h3 className="font-bold text-[#0B162C] text-lg">แก้ไขคุณวุฒิ</h3>
              <button onClick={() => setEditingQual(null)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSaveEditQual} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อคุณวุฒิ</label>
                  <input 
                    type="text" 
                    required
                    value={editingQual.name} 
                    onChange={(e) => setEditingQual({...editingQual, name: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">เบี้ยเป้าหมาย (บาท)</label>
                  <input 
                    type="number" 
                    required
                    value={editingQual.target} 
                    onChange={(e) => setEditingQual({...editingQual, target: Number(e.target.value)})}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingQual(null)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-[#D4AF37] text-[#0B162C] font-bold rounded-lg hover:bg-[#C5A059] shadow-md transition transform hover:-translate-y-0.5">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSpecialUser && (
        <div className="fixed inset-0 bg-[#0B162C]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border-t-4 border-[#D4AF37] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex justify-between items-center bg-[#FDFBF7]">
              <div>
                <h3 className="font-bold text-[#0B162C] text-lg flex items-center gap-2">⭐ จัดการคุณวุฒิพิเศษ</h3>
                <p className="text-sm text-slate-500 mt-1">สำหรับ: <span className="font-bold text-[#D4AF37]">{editingSpecialUser.name}</span></p>
              </div>
              <button onClick={() => setEditingSpecialUser(null)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-2">
                <label className="block text-base font-bold text-slate-700 mb-3 flex items-center gap-2">เพิ่มคุณวุฒิพิเศษใหม่</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อคุณวุฒิพิเศษ</label>
                    <input 
                      type="text" 
                      value={newSpecialQualName}
                      onChange={(e) => setNewSpecialQualName(e.target.value)}
                      placeholder="เช่น โบนัสไตรมาส, ทริปยุโรป"
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">เบี้ยเป้าหมาย (บาท)</label>
                    <input 
                      type="number" 
                      value={newSpecialQualTarget}
                      onChange={(e) => setNewSpecialQualTarget(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <button type="button" onClick={handleAddSpecialQual} className="w-full bg-[#0B162C] text-[#D4AF37] p-2 rounded-lg font-bold hover:bg-[#152238] text-sm flex justify-center items-center gap-1 shadow-sm transition">
                      <Plus size={16}/> เพิ่ม
                    </button>
                  </div>
                </div>
                
                <h4 className="font-bold text-[#0B162C] mb-3 border-b pb-2">รายการคุณวุฒิพิเศษที่มีอยู่</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {specialQualsList.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4 border border-dashed rounded-xl">ยังไม่มีคุณวุฒิพิเศษสำหรับสมาชิกท่านนี้</p>
                  )}
                  {specialQualsList.map((qual, idx) => (
                    <div key={qual.id} className="flex justify-between items-center p-3 bg-white border border-[#D4AF37]/40 rounded-xl text-sm shadow-sm hover:border-[#D4AF37] transition">
                      <div>
                        <span className="font-bold text-[#0B162C] block flex items-center gap-2"><Trophy size={14} className="text-[#D4AF37]"/> {qual.name}</span>
                        <span className="text-xs text-slate-500">เป้าหมาย: {qual.target.toLocaleString()} บาท</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveSpecialQual(qual.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1">
                        <Trash2 size={16}/> ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEditingSpecialUser(null)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition">ยกเลิก</button>
              <button onClick={handleSaveSpecialQuals} className="px-6 py-2.5 bg-[#D4AF37] text-[#0B162C] font-bold rounded-xl hover:bg-[#C5A059] shadow-lg shadow-[#D4AF37]/30 transition transform hover:-translate-y-0.5 flex items-center gap-2">
                <Save size={18}/> บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminVideos({ videos, setVideos, showAlert, showConfirm }) {
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: '' });

  const handleAddVideo = (e) => {
    e.preventDefault();
    if(!newVideo.title || !newVideo.url || !newVideo.category) return showAlert('กรอกข้อมูลให้ครบ');
    
    let embedUrl = newVideo.url;
    
    if (!embedUrl.includes('youtube.com/embed/')) {
      const extractVideoID = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
        return match ? match[1] : null;
      };
      
      const videoId = extractVideoID(newVideo.url);
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else {
        return showAlert('รูปแบบลิงก์ YouTube ไม่ถูกต้องครับ\n(โปรดใช้ลิงก์คลิปปกติ หรือ Shorts จาก Youtube.com)');
      }
    }

    const payload = { ...newVideo, url: embedUrl, id: Date.now() };
    setVideos([...videos, payload]);
    setNewVideo({ title: '', url: '', category: '' });
    
    // API Sync
    fetchApi("addVideo", payload).catch(() => {});
    showAlert('เพิ่มวีดีโอเรียบร้อยแล้ว');
  };

  const handleDelete = (id) => {
    showConfirm('ต้องการลบวีดีโอนี้ใช่หรือไม่?', () => {
      setVideos(videos.filter(v => v.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-6 flex items-center gap-2"><Video className="text-[#D4AF37]" /> เพิ่มวีดีโอความรู้ใหม่</h3>
        <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อคลิป / หลักสูตร</label>
            <input type="text" required value={newVideo.title} onChange={e=>setNewVideo({...newVideo, title: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">หมวดหมู่</label>
            <input type="text" required value={newVideo.category} onChange={e=>setNewVideo({...newVideo, category: e.target.value})} placeholder="เช่น ทักษะการขาย, สินค้า" className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">ลิงก์ YouTube (URL)</label>
            <input type="text" required value={newVideo.url} onChange={e=>setNewVideo({...newVideo, url: e.target.value})} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] shadow-md shadow-[#0B162C]/10 transition transform hover:-translate-y-0.5">เพิ่มวีดีโอเข้าระบบ</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
          <h3 className="text-xl font-bold text-[#0B162C]">รายการวีดีโอในระบบ</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="p-4 w-16"></th>
              <th className="p-4 font-bold text-slate-600">ชื่อคลิป</th>
              <th className="p-4 font-bold text-slate-600">หมวดหมู่</th>
              <th className="p-4 font-bold text-slate-600 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {videos.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-center"><PlayCircle className="text-[#D4AF37] mx-auto"/></td>
                <td className="p-4 font-medium text-[#0B162C]">{v.title}</td>
                <td className="p-4"><span className="bg-[#FDFBF7] border border-[#D4AF37]/30 text-[#0B162C] px-3 py-1 rounded-full text-xs font-bold">{v.category}</span></td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminContents({ contents, setContents, showAlert, showConfirm }) {
  const [newContent, setNewContent] = useState({ type: 'image', title: '', url: '', content: '' });

  const handleAddContent = (e) => {
    e.preventDefault();
    if(!newContent.title) return showAlert('กรุณากรอกชื่อคอนเทนต์');
    if(newContent.type === 'caption' && !newContent.content) return showAlert('กรุณากรอกข้อความแคปชั่น');
    if(newContent.type !== 'caption' && !newContent.url) return showAlert('กรุณากรอกลิงก์รูปภาพ/วีดีโอ');
    
    const payload = { ...newContent, id: Date.now() };
    setContents([payload, ...contents]);
    setNewContent({ type: 'image', title: '', url: '', content: '' });
    
    // API Sync
    fetchApi("addContent", payload).catch(() => {});
    showAlert('เพิ่มคอนเทนต์เรียบร้อยแล้ว');
  };

  const handleDelete = (id) => {
    showConfirm('ต้องการลบคอนเทนต์นี้ใช่หรือไม่?', () => {
      setContents(contents.filter(c => c.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-6 flex items-center gap-2"><ImageIcon className="text-[#D4AF37]" /> เพิ่มคอนเทนต์ใหม่</h3>
        <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ประเภท</label>
            <select value={newContent.type} onChange={e=>setNewContent({...newContent, type: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow bg-white text-[#0B162C] font-medium">
              <option value="image">รูปภาพ</option>
              <option value="video">วีดีโอ (คลิปสั้น)</option>
              <option value="caption">แคปชั่น (ข้อความ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อคอนเทนต์</label>
            <input type="text" required value={newContent.title} onChange={e=>setNewContent({...newContent, title: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" placeholder="เช่น แคปชั่นขายประกันสุขภาพ" />
          </div>
          
          {newContent.type !== 'caption' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">ลิงก์ URL (รูปภาพ หรือ คลิปวีดีโอ)</label>
              <input type="text" required value={newContent.url} onChange={e=>setNewContent({...newContent, url: e.target.value})} placeholder="https://..." className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow" />
            </div>
          )}
          
          {newContent.type === 'caption' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">ข้อความแคปชั่น</label>
              <textarea required value={newContent.content} onChange={e=>setNewContent({...newContent, content: e.target.value})} placeholder="พิมพ์ข้อความแคปชั่นที่นี่..." rows="3" className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow"></textarea>
            </div>
          )}

          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] shadow-md shadow-[#0B162C]/10 transition transform hover:-translate-y-0.5">เพิ่มคอนเทนต์เข้าระบบ</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 bg-[#FDFBF7]">
          <h3 className="text-xl font-bold text-[#0B162C]">รายการคอนเทนต์ในระบบ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600 w-28">ประเภท</th>
                <th className="p-4 font-bold text-slate-600">ชื่อคอนเทนต์</th>
                <th className="p-4 font-bold text-slate-600 text-center w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contents.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="bg-[#FDFBF7] border border-[#D4AF37]/30 text-[#0B162C] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{c.type}</span>
                  </td>
                  <td className="p-4 font-medium text-[#0B162C]">{c.title}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}