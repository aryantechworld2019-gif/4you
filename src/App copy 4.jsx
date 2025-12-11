import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Wifi, 
  LogOut, 
  History, 
  LayoutDashboard, 
  Menu, 
  X,
  Loader2,
  FileText,
  Smartphone,
  Landmark,
  UserPlus,
  Camera,
  FileTextIcon,
  HardHat,
  ListOrdered, // New icon for tasks
  MapPin, // New icon for location
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, collection, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore'; 

// --- MOCK DATA & UTILS ---

const MOCK_USER = {
  name: "Rahul Sharma",
  email: "rahul.sharma@4you.in",
  plan: "Unlimited Fiber Blast (300Mbps)",
  address: "Flat 402, Krishna Residency, Indiranagar, Bengaluru"
};

const INITIAL_BILLS = [
  { id: 101, month: "October 2023", amount: 1179.00, dueDate: "2023-11-05", status: "Overdue", pdf: "bill_oct.pdf" },
  { id: 102, month: "September 2023", amount: 1179.00, dueDate: "2023-10-05", status: "Paid", pdf: "bill_sep.pdf" },
  { id: 103, month: "August 2023", amount: 1179.00, dueDate: "2023-09-05", status: "Paid", pdf: "bill_aug.pdf" },
  { id: 104, month: "July 2023", amount: 1179.00, dueDate: "2023-08-05", status: "Paid", pdf: "bill_jul.pdf" },
  { id: 105, month: "June 2023", amount: 1499.00, dueDate: "2023-07-05", status: "Paid", pdf: "bill_jun.pdf" },
];

const LOADING_MESSAGES = [
  "Waiting for the OTP SMS...",
  "Calculating 18% GST...",
  "Connecting to the bank server (it's lunch time)...",
  "Looking for cashback offers...",
  "Asking the neighbors to get off your WiFi...",
  "Verifying with Aadhaar..." 
];

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const ENGINEER_COLLECTION = 'new_broadband_users';


// --- COMPONENTS ---

// 1. Login Component - Updated with Role Selection (Unchanged)
const Login = ({ onLogin, setUserRole }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'engineer'

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate basic validation for a 10-digit number
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
      setError("Mobile number must be 10 digits only. Please check the digits!");
      setLoading(false);
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      let success = false;
      if (role === 'customer' && password === 'password') {
        success = true;
      } else if (role === 'engineer' && mobileNumber === '8888888888' && password === 'engineer') {
        success = true;
      }

      if (success) {
        setUserRole(role);
        onLogin();
      } else {
        if (role === 'customer') {
          setError("Wrong password, bhai. Just type 'password'.");
        } else {
          setError("Engineer credentials invalid. Check mobile (8888888888) and password (engineer).");
        }
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-orange-100">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-600 p-3 rounded-full">
            <Wifi className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">4You Broadband India</h2>
        <p className="text-center text-gray-500 mb-8">Login to manage your connection, ji.</p>
        
        {/* Role Selection Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button 
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${role === 'customer' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Customer
          </button>
          <button 
            type="button"
            onClick={() => setRole('engineer')}
            className={`flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${role === 'engineer' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <HardHat className="w-4 h-4 inline mr-1" /> Engineer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{role === 'engineer' ? 'Engineer Mobile (8888888888)' : 'Mobile Number'}</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
              <span className="text-gray-500 border-r border-gray-300 p-2.5 bg-gray-50 rounded-l-lg">+91</span>
              <input 
                type="text"
                required
                maxLength="10"
                minLength="10"
                className="w-full px-4 py-2 bg-transparent outline-none"
                placeholder="9876543210 (10 Digits Only)"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))} // Only allow digits
              />
            </div>
            
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{role === 'engineer' ? 'Password (engineer)' : 'Password (password)'}</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login Karo"}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Engineer New Customer Onboarding Component
const EngineerDashboard = ({ db, userId, showNotification }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('100 Mbps Standard');
  const [newPassword, setNewPassword] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [kycDoc, setKycDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file && file.size > 2097152) { // 2MB limit
      showNotification("File size too big, yaar! Max 2MB allowed.", 'error');
      e.target.value = null;
      setFile(null);
      return;
    }
    setFile(file);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!db || !userId) {
      showNotification("Database not ready. Wait for a second!", 'error');
      setLoading(false);
      return;
    }

    if (!name || !mobile || !address || !plan || !newPassword || !userPhoto || !kycDoc) {
      showNotification("Please fill all details and upload files. KYC is mandatory!", 'error');
      setLoading(false);
      return;
    }
    
    // Simple 10-digit mobile number validation
    if (mobile.length !== 10 || isNaN(mobile)) {
      showNotification("Mobile number must be 10 digits.", 'error');
      setLoading(false);
      return;
    }


    try {
      // 1. Save New User Data to the Public Collection
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const usersCollectionRef = collection(db, `artifacts/${appId}/public/data/${ENGINEER_COLLECTION}`);
      
      const newUserData = {
        name: name,
        mobile: mobile,
        address: address,
        plan: plan,
        initialPassword: newPassword, // Store initial password for activation
        photoFileName: userPhoto.name,
        documentFileName: kycDoc.name,
        status: 'Pending Installation', // Initial status
        createdByEngineer: userId,
        createdAt: new Date().toISOString()
      };

      await addDoc(usersCollectionRef, newUserData);

      showNotification(`User ${name} added successfully! Installation is scheduled.`, 'success');
      
      // 2. Reset Form
      setName('');
      setMobile('');
      setAddress('');
      setPlan('100 Mbps Standard');
      setNewPassword('');
      setUserPhoto(null);
      setKycDoc(null);
      // Reset file inputs via DOM manipulation since they are uncontrolled
      document.getElementById('userPhoto').value = null;
      document.getElementById('kycDoc').value = null;

    } catch (error) {
      console.error("Error adding new user: ", error);
      showNotification(`Error saving data: ${error.message}. Please check console.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const plans = ["100 Mbps Standard", "300 Mbps Fiber Blast", "500 Mbps Pro Gamer", "1 Gbps Premium"];

  const FileUploadArea = ({ icon: Icon, title, file, id, setFile }) => (
    <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
      <label htmlFor={id} className="cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500">{file ? file.name : 'Click to upload (Max 2MB)'}</p>
            </div>
          </div>
          <button type="button" className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${file ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {file ? 'Uploaded' : 'Select File'}
          </button>
        </div>
      </label>
      <input 
        type="file" 
        id={id} 
        hidden 
        accept="image/*, .pdf"
        onChange={(e) => handleFileChange(e, setFile)}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-orange-600" /> New Customer Activation (KYC)
      </h2>
      <p className="text-gray-600">Fill out the new customer's details and upload their KYC documents for activation. Connection only starts after document submission, boss.</p>
      
      <form onSubmit={handleAddUser} className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-orange-100">
        <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mb-4">User Details</h3>
        
        {/* Name and Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="e.g., Suresh Kumar" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (10 Digits)</label>
            <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))} required maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="98XXXXXXXX" />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Installation Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="Flat No, Building, Street, City, PIN Code" />
        </div>

        {/* Plan and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selected Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none bg-white">
              {plans.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none" placeholder="Set temporary login password" />
          </div>
        </div>

        <h3 className="font-semibold text-lg text-gray-700 border-b pt-4 pb-2 mb-4">KYC & Documents</h3>
        
        {/* File Uploads */}
        <div className="space-y-4">
          <FileUploadArea 
            icon={Camera} 
            title="User Photo (Passport Size)" 
            file={userPhoto} 
            id="userPhoto" 
            setFile={setUserPhoto}
          />
          <FileUploadArea 
            icon={FileTextIcon} 
            title="Aadhaar/KYC Document" 
            file={kycDoc} 
            id="kycDoc" 
            setFile={setKycDoc}
          />
          <p className="text-xs text-gray-500 pt-2">Note: Files are mocked and only their names are stored in Firestore, not the actual file data.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Activation & Save Data"}
        </button>
      </form>
    </div>
  );
};


// 3. Engineer Tasks/List Component (NEW)
const EngineerTasks = ({ db, userId, showNotification, newlyActivatedUsers, isAuthReady }) => {
  const [loading, setLoading] = useState(false);

  // Status badge utility for tasks
  const TaskStatusBadge = ({ status }) => {
    const styles = {
      'Pending Installation': "bg-yellow-100 text-yellow-800 border-yellow-200",
      'Installation Scheduled': "bg-blue-100 text-blue-800 border-blue-200",
      'Completed': "bg-green-100 text-green-800 border-green-200",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Pending Installation']}`}>
        {status}
      </span>
    );
  };

  const handleUpdateStatus = async (user, newStatus) => {
    setLoading(true);
    if (!db) {
        showNotification("Database not ready.", 'error');
        setLoading(false);
        return;
    }

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userDocRef = doc(db, `artifacts/${appId}/public/data/${ENGINEER_COLLECTION}`, user.id);
      
      await setDoc(userDocRef, { 
        status: newStatus, 
        lastUpdatedBy: userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      showNotification(`Task for ${user.name} updated to ${newStatus}!`, 'success');
    } catch (error) {
      console.error("Error updating status: ", error);
      showNotification(`Error updating status: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = newlyActivatedUsers.filter(u => u.status !== 'Completed');
  const completedTasks = newlyActivatedUsers.filter(u => u.status === 'Completed');

  if (!isAuthReady) {
    return <div className="text-center p-8 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" /> Fetching tasks from HQ...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ListOrdered className="w-6 h-6 text-orange-600" /> Pending Installation & Activation Tasks
      </h2>
      <p className="text-gray-600">This list shows all new customers added by any engineer. Tap to update the installation status.</p>

      {/* Pending Tasks List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-100">
        <div className="p-4 bg-gray-50 font-semibold text-gray-700">Pending ({pendingTasks.length})</div>
        {pendingTasks.length === 0 ? (
          <p className="p-6 text-center text-gray-500">All set, no pending installations. Time for chai!</p>
        ) : (
          pendingTasks.map((user) => (
            <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{user.name} ({user.mobile})</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{user.address}</span>
                  </p>
                  <div className="mt-2">
                    <TaskStatusBadge status={user.status} />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {user.status === 'Pending Installation' && (
                    <button 
                      onClick={() => handleUpdateStatus(user, 'Installation Scheduled')}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Schedule
                    </button>
                  )}
                  {user.status === 'Installation Scheduled' && (
                    <button 
                      onClick={() => handleUpdateStatus(user, 'Completed')}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden divide-y divide-gray-100">
        <div className="p-4 bg-gray-50 font-semibold text-gray-700">Completed ({completedTasks.length})</div>
        {completedTasks.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No completed tasks yet.</p>
        ) : (
          completedTasks.map((user) => (
            <div key={user.id} className="p-4 opacity-70">
              <div className="flex justify-between items-center text-sm">
                <p className="font-medium text-gray-600 truncate">{user.name}</p>
                <TaskStatusBadge status={user.status} />
              </div>
              <p className="text-xs text-gray-400 truncate">{user.address}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// 4. Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('customer'); // Default to customer
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [notification, setNotification] = useState(null);

  // Firebase State
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Engineer State (NEW)
  const [newlyActivatedUsers, setNewlyActivatedUsers] = useState([]);


  // --- FIX FOR HOOK VIOLATION: Moved conditional useEffect above conditional return ---
  // This hook ensures the correct initial view is set *after* login, running on every render.
  useEffect(() => {
    // Only run this logic if isAuthenticated is true
    if (isAuthenticated) {
      if (userRole === 'engineer') {
        setCurrentView('tasks'); // Default engineer view changed to tasks
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, userRole]);
  // --- END HOOK FIX ---

  // --- FIREBASE INITIALIZATION ---
  useEffect(() => {
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Sign in anonymously if no token or token expired/invalid
                try {
                    // Check if token was present but failed, if not, sign in anonymously
                    if (!initialAuthToken) {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (anonError) {
                    console.error("Anonymous sign-in failed:", anonError);
                }
            }
            setIsAuthReady(true);
        });

        if (initialAuthToken) {
            signInWithCustomToken(firebaseAuth, initialAuthToken).catch(e => {
                console.error("Custom token sign-in failed, proceeding with anonymous.", e);
            });
        } else {
             // Sign in anonymously if no token is provided
             signInAnonymously(firebaseAuth);
        }

        return () => unsubscribe();
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
    }
  }, []);
  // --- END FIREBASE INITIALIZATION ---

  // --- FIREBASE ENGINEER DATA LISTENER (NEW) ---
  useEffect(() => {
    if (!db || !isAuthReady) return; // Wait for DB and Auth to be ready

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const collectionPath = `artifacts/${appId}/public/data/${ENGINEER_COLLECTION}`;
    
    // We query the public collection
    const q = query(collection(db, collectionPath));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        // Sort by creation date, most recent first (must be done client-side if no index is provided)
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 
        setNewlyActivatedUsers(users);
    }, (error) => {
        console.error("Error listening to engineer data:", error);
    });

    return () => unsubscribe();
  }, [db, isAuthReady]);
  // --- END FIREBASE ENGINEER DATA LISTENER ---


  // Derived state (only needed for customer view)
  const overdueBills = bills.filter(b => b.status === 'Overdue');
  const totalDue = overdueBills.reduce((acc, curr) => acc + curr.amount, 0);

  // Toast notification handler
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Payment Logic (Customer View)
  const handlePayBill = (bill) => {
    setSelectedBill(bill);
    setPaymentModalOpen(true);
  };

  const processPayment = () => {
    // Optimistic update
    const updatedBills = bills.map(b => 
      b.id === selectedBill.id ? { ...b, status: 'Paid' } : b
    );
    setBills(updatedBills);
    setPaymentModalOpen(false);
    showNotification(`Payment successful! Enjoy the cricket match without buffering.`);
  };

  // Download Logic (Customer View)
  const handleDownload = (fileName) => {
    showNotification(`Downloading ${fileName}... saving for tax returns?`, 'info');
  };

  // Conditional early return for Login
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} setUserRole={setUserRole} />;
  }
  

  // Common Layout Components
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl md:shadow-none`}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Wifi className="text-orange-500" />
          <span>4You <span className="text-xs font-normal text-orange-300">India</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X />
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        {userRole === 'customer' ? (
          <>
            <button 
              onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Customer Dashboard
            </button>
            <button 
              onClick={() => { setCurrentView('history'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'history' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <History className="w-5 h-5" />
              Billing History
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => { setCurrentView('tasks'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'tasks' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <ListOrdered className="w-5 h-5" />
              Installation Tasks
            </button>
            <button 
              onClick={() => { setCurrentView('onboarding'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'onboarding' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <UserPlus className="w-5 h-5" />
              New Customer KYC
            </button>
          </>
        )}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
            {userRole === 'engineer' ? <HardHat className="w-4 h-4" /> : 'RS'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userRole === 'engineer' ? 'Site Engineer' : MOCK_USER.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === 'engineer' ? `ID: ${userId?.substring(0, 8)}...` : MOCK_USER.email}
            </p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      Paid: "bg-green-100 text-green-700 border-green-200",
      Overdue: "bg-red-100 text-red-700 border-red-200",
      Due: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.Due}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            {userRole === 'engineer' ? 'Engineer Activation Panel' : 'Namaste, Rahul!'}
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="hidden sm:inline">Connection: First Class</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Notification Toast */}
          {notification && (
            <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 animate-slide-in ${
              notification.type === 'success' ? 'bg-white border-green-200 text-green-800' : 
              notification.type === 'error' ? 'bg-white border-red-200 text-red-800' :
              'bg-white border-blue-200 text-blue-800'
            }`}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
               notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
               <Download className="w-5 h-5 text-blue-500" />}
              <p className="font-medium">{notification.message}</p>
            </div>
          )}

          {/* ENGINEER VIEWS */}
          {userRole === 'engineer' && (
            <>
              {currentView === 'onboarding' && (
                <EngineerDashboard db={db} userId={userId} showNotification={showNotification} />
              )}
              {currentView === 'tasks' && (
                <EngineerTasks 
                  db={db} 
                  userId={userId} 
                  showNotification={showNotification} 
                  newlyActivatedUsers={newlyActivatedUsers}
                  isAuthReady={isAuthReady}
                />
              )}
            </>
          )}

          {/* CUSTOMER VIEWS */}
          {userRole === 'customer' && currentView === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Alert Banner */}
              {overdueBills.length > 0 ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-800">Bill Pending, Boss!</h3>
                      <p className="text-red-600 text-sm">You have {overdueBills.length} unpaid bill(s). Don't let the internet stop.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePayBill(overdueBills[0])}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm whitespace-nowrap w-full sm:w-auto"
                  >
                    Pay Due: {formatCurrency(totalDue)}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Sab Theek Hai! (All Good)</h3>
                    <p className="text-green-600">No dues. You are a responsible citizen.</p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Current Plan</p>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">{MOCK_USER.plan}</h3>
                    <Wifi className="text-orange-500 w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Cycle resets: 25th Nov</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Outstanding Balance (inc. GST)</p>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className={`text-3xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatCurrency(totalDue)}
                    </h3>
                    <Landmark className="text-gray-400 w-6 h-6" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {totalDue > 0 ? "Pay fast to avoid late fees!" : "Zero balance. Nice."}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Recent Bills</h3>
                  <button onClick={() => setCurrentView('history')} className="text-sm text-orange-600 hover:text-orange-800 font-medium">View All</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {bills.slice(0, 3).map((bill) => (
                    // Responsive Row: Flex-col on mobile, flex-row on desktop
                    <div key={bill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${bill.status === 'Overdue' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{bill.month}</p>
                          <p className="text-xs text-gray-500">Due: {bill.dueDate}</p>
                        </div>
                      </div>
                      
                      {/* Actions & Amount: Full width on mobile to accommodate button */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-11 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-gray-800">{formatCurrency(bill.amount)}</p>
                          <StatusBadge status={bill.status} />
                        </div>
                        {bill.status === 'Overdue' && (
                          <button 
                            onClick={() => handlePayBill(bill)}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'history' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Month</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Due Date</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Amount (₹)</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap">Status</th>
                        <th className="p-4 font-semibold text-gray-600 text-sm text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{bill.month}</td>
                          <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{bill.dueDate}</td>
                          <td className="p-4 font-semibold text-gray-700 whitespace-nowrap">{formatCurrency(bill.amount)}</td>
                          <td className="p-4 whitespace-nowrap"><StatusBadge status={bill.status} /></td>
                          <td className="p-4 text-right flex justify-end gap-2 whitespace-nowrap">
                            {bill.status === 'Overdue' && (
                              <button 
                                onClick={() => handlePayBill(bill)}
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded shadow-sm"
                              >
                                Pay Now
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownload(bill.pdf)}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PAYMENT MODAL (Customer View) */}
      {paymentModalOpen && selectedBill && (
        <PaymentModal 
          bill={selectedBill} 
          onClose={() => setPaymentModalOpen(false)} 
          onSuccess={processPayment} 
        />
      )}
    </div>
  );
};

// 5. Payment Modal Component (Internal - Unchanged)
const PaymentModal = ({ bill, onClose, onSuccess }) => {
  const [step, setStep] = useState('review'); // review | processing | success
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (step === 'processing') {
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingMsg(LOADING_MESSAGES[i]);
      }, 1000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        onSuccess();
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all my-8">
        
        {step === 'review' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Secure Payment</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Bill for</span>
                <span>{bill.month}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-semibold text-gray-700">Total (inc. GST)</span>
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(bill.amount)}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              
              {/* UPI Option */}
              <div className="flex items-center gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer ring-1 ring-orange-500">
                <Smartphone className="text-orange-600" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">UPI / PhonePe / GPay</p>
                  <p className="text-xs text-gray-500">rahul.sharma@okaxis</p>
                </div>
                <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white shadow-sm"></div>
              </div>

              {/* Card Option */}
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <CreditCard className="text-gray-400" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">HDFC Debit Card</p>
                  <p className="text-xs text-gray-500">**4242</p>
                </div>
              </div>

              {/* NetBanking Option */}
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <Landmark className="text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-600">Net Banking</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep('processing')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              Pay {formatCurrency(bill.amount)}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
              Secured by Razorpay (Simulated)
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Processing Payment...</h3>
            <p className="text-gray-500 text-sm animate-pulse">{loadingMsg}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;