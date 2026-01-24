import React, { useState, useEffect } from 'react';
import {
    Truck, ShieldCheck, Calendar, Phone, MapPin,
    ChevronRight, Clock, Menu, X, ArrowRight, CheckCircle2,
    AlertTriangle, Star, Zap, MessageSquare,
    CloudIcon, CreditCard, Lock, RefreshCw, Settings, Info, Map as MapIcon,
    Search
} from 'lucide-react';
import { mapData } from './MapData';

// --- ZIP CODE DATABASE (Service Area: Peninsula, East Bay, South Bay) ---
const BAY_AREA_ZIPS = {
    'Alameda': ['94501', '94502', '94706', '94710', '94702', '94703', '94704', '94705', '94707', '94708', '94709', '94720', '94546', '94552', '94568', '94808', '94662', '94536', '94537', '94538', '94539', '94555', '94540', '94541', '94542', '94543', '94544', '94545', '94557', '94550', '94551', '94560', '94601', '94602', '94603', '94605', '94606', '94607', '94610', '94611', '94612', '94613', '94619', '94621', '94618', '94620', '94566', '94588', '94577', '94578', '94580', '94586', '94587'],
    'Contra Costa': ['94507', '94509', '94531', '94565', '94511', '94506', '94513', '94516', '94517', '94520', '94518', '94519', '94521', '94523', '94525', '94526', '94528', '94505', '94514', '94530', '94803', '94547', '94549', '94553', '94556', '94561', '94563', '94564', '94801', '94804', '94805', '94806', '94850', '94595', '94596', '94597', '94598', '94582', '94583'],
    'San Francisco': ['94101', '94102', '94103', '94104', '94105', '94106', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94119', '94120', '94121', '94122', '94123', '94124', '94126', '94127', '94129', '94130', '94131', '94132', '94133', '94134', '94135', '94136', '94137', '94138', '94139', '94140', '94141', '94142', '94143', '94144', '94145', '94146', '94147', '94150', '94151', '94152', '94153', '94154', '94155', '94156', '94157', '94158', '94159', '94160', '94161', '94162', '94163', '94164', '94165', '94166', '94167', '94168', '94169', '94170', '94171', '94172', '94175', '94177', '94188', '94199'],
    'San Mateo': ['94027', '94011', '94014', '94030', '94028', '94062', '94019', '94010', '94044', '94080', '94002', '94003', '94005', '94012', '94013', '94015', '94016', '94017', '94018', '94020', '94021', '94025', '94026', '94029', '94031', '94037', '94038', '94045', '94059', '94060', '94061', '94063', '94064', '94065', '94066', '94067', '94070', '94071', '94074', '94083', '94096', '94098', '94099', '94125', '94128', '94307', '94401', '94402', '94403', '94404', '94405', '94406', '94407', '94408', '94409', '94497', '95006'],
    'Santa Clara': ['94022', '94024', '94035', '94040', '94041', '94043', '94085', '94086', '94087', '94089', '94090', '94301', '94302', '94303', '94304', '94305', '94306', '94308', '94309', '94310', '95002', '95008', '95009', '95011', '95013', '95014', '95015', '95020', '95021', '95023', '95026', '95030', '95031', '95032', '95033', '95035', '95036', '95037', '95038', '95042', '95044', '95046', '95050', '95051', '95053', '95054', '95055', '95056', '95070', '95071', '95101', '95102', '95110', '95111', '95112', '95113', '95114', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95137', '95138', '95139', '95140', '95141', '95142', '95148', '95156', '95157', '95158', '95159', '95160', '95161', '95164', '95170', '95171', '95172', '95173', '95190', '95191', '95192', '95193', '95194', '95196'],
};

const getCountyFromZip = (zip) => {
    for (const [county, zips] of Object.entries(BAY_AREA_ZIPS)) {
        if (zips.includes(zip)) return county;
    }
    return null;
};

// --- Assets ---

// Apple Pay (Standard Black Button Style)
const ApplePayIcon = () => (
    <svg viewBox="0 0 100 40" className="h-full w-full" style={{ maxHeight: '24px' }}>
        <path fill="currentColor" d="M37.5 15.6c.3-2.6 3.6-4 4.5-4.2-.6-4.6-6-4.4-6.8-4.3-.9 0-2.3.5-3.1 1.6-1.3 1.5-1 4.2.3 6.9zM38.8 28.1s-.4 1.4-1.2 1.4-1.6-.9-2.2-1.4c-1.3-1-3.2-1-4.7 0-.5.4-1.2 1.4-2.2 1.4s-2.1-1.3-3.1-2.9C23.2 23.3 22 17.6 26 15.7c2-.9 3.6-.2 4.6.4.7.5 1.5.8 2.2.8 1 0 1.9-.6 2.5-1 1.7-1 4.5-2.2 6.8-.2.2.1.8.8 1 1-3.3 1.7-2.6 6.3.7 7.7 0 .1-.3 1.4-1 2.3-1 1.5-2.3 2.6-4 1.4zM49.2 11.7h3v8.5c0 1.4 0 2.2.1 2.5.3.9 1.4 1.4 2.8 1.4 1.3 0 2.4-.6 2.8-1.5.1-.3.1-1.1.1-2.5v-8.4h3v9.2c0 1.5-.1 2.5-.2 3.1-.4 1.5-1.6 2.7-3.7 2.7-2.4 0-4-1.3-4.6-3-.2-.5-.2-1.3-.2-3.1h-.2l-5.6 14.5H43l1.8-4.4-4-10.1h3.3l1.9 5.8 1.8 5.7.1-5.7 1.3-5.7zM71 20.3c0 2.3 1.4 3.4 4 3.4 1 0 1.9-.2 2.6-.5v2.2c-.8.4-1.9.6-3.1.6-4.4 0-6.4-2.5-6.4-6.2 0-3.6 2-6.5 6-6.5 4.3 0 5.6 3.4 5.6 6.1v.9H71zM76.9 18C76.8 16.5 76 15.2 74 15.2c-1.6 0-2.6 1.1-2.9 2.8H76.9zM86.1 13.9c1 0 1.9.3 2.6.9v-5H92v16.1c0 2.2-.4 3.7-1.3 4.8-1 1.2-2.7 1.9-4.8 1.9-2.1 0-3.7-.7-4.6-1.5l1.3-2.1c.8.6 1.8 1.1 3.3 1.1 1.1 0 2.1-.4 2.6-1.1.4-.5.5-1.3.5-2.6v-1.1c-.8.9-1.9 1.4-3.3 1.4-2.8 0-5.1-2.1-5.1-5.6 0-3.4 2.1-5.6 4.8-5.6zm2.9 5.7v-1.1c0-1.7-1.1-3.2-3-3.2-1.7 0-2.9 1.3-2.9 3.2 0 1.9 1.2 3.2 2.9 3.2 1.9-.1 3-.9 3-2.1z" />
    </svg>
);

// Google Pay (G + Pay style)
const GooglePayIcon = () => (
    <div className="flex items-center justify-center gap-1.5 h-full">
        <svg viewBox="0 0 24 24" className="h-5">
            <path fill="#4285F4" d="M23.5 12.2c0-.9-.1-1.7-.2-2.5H12v4.8h6.4c-.3 1.6-1.1 2.9-2.3 3.7v3.1h3.7c2.2-2 3.4-5 3.4-8.5v-.6z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-3.1c-1.1.7-2.4 1.1-4.2 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.3 7.4 24 12 24z" />
            <path fill="#FBBC04" d="M5.4 14.2c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2V6.7H1.4C.5 8.4 0 10.2 0 12s.5 3.6 1.4 5.3l4-3.1z" />
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C18 1.3 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.7l4 3.1c.9-2.8 3.5-4.9 6.6-4.9z" />
        </svg>
        <span className="font-medium text-slate-500 text-lg relative top-[1px] tracking-tight">Pay</span>
    </div>
);

// --- Components ---

// Bay Area Map (Block/Topological Style)
// BayAreaMap: Interactive, Topographically Accurate Map
const BayAreaMap = ({ selectedCounty, onSelect }) => {
    // Colors matching the user's reference image style (Removed North Bay Colors)
    const getFill = (name) => {
        if (selectedCounty === name) return 'fill-slate-900'; // Selected state
        const colors = {
            'Contra Costa': '#F97316', 'Alameda': '#F97316', // East Bay (Orange)
            'San Francisco': '#DC2626', // SF (Red)
            'San Mateo': '#DB2777', // Peninsula (Pink)
            'Santa Clara': '#16A34A', // South Bay (Green)
        };
        return colors[name] || '#CBD5E1'; // Others default to gray
    };

    return (
        <div className="w-full aspect-[3/4] relative bg-slate-50 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
            {/* ViewBox calculated to center the Bay Area counties with padding */}
            <svg viewBox="-392 -775 1812 2411" className="w-full h-full">
                {/* Context Counties (Gray Background) */}
                {mapData.context && Object.entries(mapData.context).map(([name, d]) => (
                    <path key={name} d={d} className="fill-slate-200 stroke-white stroke-[3]" />
                ))}

                {/* Bay Area Counties (Interactive) */}
                {mapData.bayArea && Object.entries(mapData.bayArea).map(([name, d]) => {
                    const isSelected = selectedCounty === name;
                    return (
                        <g key={name} onClick={() => onSelect(name)} className="cursor-pointer group">
                            <path
                                d={d}
                                fill={getFill(name)}
                                className={`stroke-white stroke-[4] transition-all duration-300 ${isSelected ? 'brightness-75' : 'hover:brightness-90 hover:scale-[1.01] origin-center'}`}
                            />
                            {/* Optional: Add text labels here if needed, but the colorful map is self-explanatory with the input field above */}
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-bold shadow-sm border border-slate-100 uppercase tracking-widest text-slate-400 pointer-events-none">
                Interactive Map
            </div>
        </div>
    );
};

const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [view, setView] = useState('landing');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calendarDates, setCalendarDates] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState('');

    // Initial check for Stripe Success redirect
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            const sessionId = query.get('session_id');
            if (sessionId) {
                setLoading(true);
                // Verify and Sync to Calendar
                fetch('http://localhost:4242/verify-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Calendar Sync:', data);
                        if (data.status === 'success' && data.booking) {
                            setFormData(prev => ({
                                ...prev,
                                selectedDate: data.booking.date,
                                selectedTime: data.booking.time,
                                name: data.booking.name
                            }));
                        }
                        setView('success');
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Sync Error', err);
                        setView('success'); // Show success anyway since payment worked
                        setLoading(false);
                    });
            } else {
                setView('success');
            }
        }
        if (query.get('canceled')) {
            alert('Payment canceled -- please try again.');
        }
    }, []);

    // Scroll to top when view or step changes
    useEffect(() => {
        // Use timeout to ensure it happens after content renders
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 50);
    }, [view, step]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        fleetSize: '',
        truckCount: '',
        location: '',
        zipCode: '',
        county: '',
        selectedDate: '',
        selectedTime: '',
        selectedPlan: null,
        paymentMethod: 'express',
        memo: ''
    });

    // Quick Charge POS state
    const [quickChargeData, setQuickChargeData] = useState({
        customerName: '',
        truckCount: '1',
        notes: ''
    });

    // County Schedules (Allow specific days)
    const COUNTY_SCHEDULE = {
        'San Francisco': ['Mon'],
        'San Mateo': ['Tue', 'Sat'],
        'Santa Clara': ['Wed', 'Sat'],
        'Alameda': ['Thu', 'Sun'],
        'Contra Costa': ['Fri', 'Sun']
    };

    // Available Slots Generation (1.5 hr increments, 7am - 7pm)
    const TIME_SLOTS = ['07:00 AM', '08:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];

    // Real-time Availability State
    const [busySlots, setBusySlots] = useState([]);

    // Environment Config
    const API_URL = import.meta.env.PROD ? '' : 'http://localhost:4242';

    useEffect(() => {
        if (!formData.selectedDate) return;

        // Fetch busy slots for the selected date
        const year = new Date().getFullYear();
        // Note: Logic assumes current year. For Jan/Feb next year transition, might need refinement but suffice for demo.
        const queryDate = `${formData.selectedDate} ${year}`;

        fetch(`${API_URL}/check-availability?date=${queryDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.busy) setBusySlots(data.busy);
            })
            .catch(console.error);
    }, [formData.selectedDate]);

    const isSlotBusy = (timeStr) => {
        // Convert "02:00 PM" to comparable date object for today
        // This is a simplified check. Ideally, compare full ISO strings.
        // For MVP: We check if the time slot start overlaps with any busy range.
        // ... (Simplified: If we needed full overlapping logic)

        // Actually, let's just use string matching or simple hour comparison if backend returns ISO.
        // Backend returns ISO start/end.
        if (busySlots.length === 0) return false;

        const year = new Date().getFullYear();
        const dateStr = `${formData.selectedDate} ${year} ${timeStr}`;
        const validStart = new Date(dateStr);
        const slotStart = validStart.getTime();
        const slotEnd = slotStart + (90 * 60 * 1000); // 90 minutes in ms

        console.log(`Checking Slot: ${timeStr} (${slotStart} - ${slotEnd})`);

        return busySlots.some(slot => {
            const busyStart = new Date(slot.start).getTime();
            const busyEnd = new Date(slot.end).getTime();

            // Log for debugging
            // console.log(`  vs Busy: ${slot.start} - ${slot.end}`);

            // Overlap Logic: (StartA < EndB) && (EndA > StartB)
            return (slotStart < busyEnd) && (slotEnd > busyStart);
        });
    };

    useEffect(() => {
        const today = new Date();
        const dates = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        setCalendarMonth(`${monthNames[today.getMonth()]} ${today.getFullYear()}`);

        for (let i = 0; i < 28; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i + 1);

            const dayNameFull = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
            const dayName = dayNameFull.charAt(0);
            const dayNum = date.getDate();
            const monthStr = monthNames[date.getMonth()];
            const fullDateStr = `${monthStr} ${dayNum}`;

            // Filter by County Schedule
            const allowedDays = COUNTY_SCHEDULE[formData.county] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Default to Weekdays if unknown
            const isAllowed = allowedDays.includes(dayNameFull);

            dates.push({
                day: dayNum,
                weekday: dayName,
                weekdayFull: dayNameFull,
                fullDate: fullDateStr,
                disabled: !isAllowed
            });
        }

        // Add padding for the first day (Grid starts at Sunday)
        const firstDayIndex = new Date(today);
        firstDayIndex.setDate(today.getDate() + 1);
        const paddingCount = firstDayIndex.getDay();
        const padding = Array(paddingCount).fill(null);

        setCalendarDates([...padding, ...dates]);
    }, [formData.county]);





    // Logic: Auto-Select County on Zip Change
    useEffect(() => {
        if (formData.zipCode && formData.zipCode.length === 5) {
            const county = getCountyFromZip(formData.zipCode);
            if (county) {
                setFormData(prev => ({ ...prev, county }));
            }
        }
    }, [formData.zipCode]);



    const pricingPlans = [
        { title: "Owner Operator", price: "199", features: ["1 Mobile Test", "CARB Upload", "DMV Certificate", "24hr Processing"], popular: false },
        { title: "Small Fleet", price: "175", features: ["2-10 Units", "Priority Slot", "Cloud Archive", "Compliance Alerts"], popular: true },
        { title: "Enterprise", price: "145", features: ["10+ Units", "Volume Discount", "Custom Scheduling", "Dedicated Rep"], popular: false }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate price per truck based on quantity tiers
    const getPricePerTruck = (count) => {
        const numTrucks = parseInt(count) || 1;
        if (numTrucks === 1) return 199;
        if (numTrucks >= 2 && numTrucks <= 10) return 175;
        return 145; // 11+ trucks
    };

    const calculateTotal = () => {
        const count = parseInt(formData.truckCount) || 1;
        const pricePerTruck = getPricePerTruck(count);
        return count * pricePerTruck;
    };

    const handleFinalBooking = async () => {
        setLoading(true);

        const truckCount = parseInt(formData.truckCount) || 1;
        const pricePerTruck = getPricePerTruck(truckCount);
        const totalPrice = truckCount * pricePerTruck;

        const payload = {
            ...formData,
            truckCount,
            pricePerTruck,
            totalPrice
        };


        try {
            console.log('Initiating Stripe Checkout with:', payload);

            // Call our local backend to create the checkout session
            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    // Redirect to Stripe Checkout
                    window.location.href = data.url;
                } else {
                    alert('Error: No checkout URL returned from server.');
                }
            } else {
                const errorText = await response.text();
                alert(`Server Error ${response.status}: ${errorText}`);
            }
        } catch (e) {
            console.error(e);
            alert('Booking error. Please check console.');
        }
        setLoading(false);
    };

    // Quick Charge POS - direct checkout without scheduling
    const handleQuickCharge = async () => {
        if (!quickChargeData.customerName || !quickChargeData.truckCount) {
            alert('Please enter customer name and truck count');
            return;
        }

        setLoading(true);
        const truckCount = parseInt(quickChargeData.truckCount) || 1;
        const pricePerTruck = getPricePerTruck(truckCount);
        const totalPrice = truckCount * pricePerTruck;

        const payload = {
            name: quickChargeData.customerName,
            truckCount,
            pricePerTruck,
            totalPrice,
            location: 'On-Site / Quick Charge',
            memo: quickChargeData.notes,
            isQuickCharge: true
        };

        try {
            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    alert('Error: No checkout URL returned.');
                }
            } else {
                alert('Server error. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('Quick charge error. Check console.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-emerald-100">

            {/* Header */}
            <div className="fixed top-0 w-full z-50">


                <nav className={`transition-all duration-500 ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
                            <img src="/logo.jpg" alt="Golden State Clean Truck Check" className={`transition-all duration-300 w-auto object-contain ${scrolled || view !== 'landing' ? 'h-12 opacity-100' : 'h-0 opacity-0 w-0'}`} />
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('quickcharge')} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30">
                                <Zap size={14} className="md:w-4 md:h-4" />
                                <span className="hidden sm:inline">Quick Charge</span>
                                <span className="sm:hidden">Pay</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <main className="pt-28">
                {view === 'landing' && (
                    <>
                        {/* Hero */}
                        <header className="pt-10 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-7">
                                <div className="flex flex-col items-center lg:items-start mb-8">
                                    <img src="/logo.jpg" alt="Golden State Clean Truck Check" className="h-48 md:h-72 w-auto object-contain mb-4" />
                                    <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">Official CARB Partner</div>
                                </div>

                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 text-slate-950">
                                    CARB Compliance, <br />
                                    <span className="text-emerald-600">Simplified.</span>
                                </h1>

                                <p className="text-xl text-slate-500 font-medium max-w-lg mb-10 leading-relaxed">
                                    Stop losing hauls. We provide elite mobile emissions testing at your yard—on your schedule. Guaranteed 24-hour certificate upload.
                                </p>

                                {/* Rapid Response List */}
                                <div className="flex flex-col gap-3 mb-12">
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Trucks 2013 and Newer</p>
                                    {['Instant OBD Uploads', 'Heavy-Duty Opacity Testing', 'DMV Registration Support'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 size={14} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setView('booking')} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3 transform hover:-translate-y-1">
                                        Schedule Inspection <ArrowRight size={20} />
                                    </button>
                                    <a href="tel:4154167565" className="bg-white border-2 border-slate-100 px-8 py-5 rounded-2xl font-black text-slate-900 uppercase tracking-widest hover:border-slate-300 transition-all flex items-center gap-3">
                                        <Phone size={18} className="text-emerald-600" /> Dispatch
                                    </a>
                                </div>
                            </div>

                            {/* Eligibility / Booking Card */}
                            <div className="lg:col-span-5 relative">
                                <div className="bg-slate-950 text-white rounded-[40px] shadow-2xl p-10 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Truck size={200} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/50">
                                            <Clock size={32} className="text-white" />
                                        </div>
                                        <h4 className="text-3xl font-black mb-2 tracking-tight">Zero Downtime.</h4>
                                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                            We work when you don't. Weekend and after-hours appointments available to keep your fleet moving.
                                        </p>

                                        <button onClick={() => { setView('booking'); }} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black hover:bg-emerald-50 transition-all flex justify-center items-center gap-2">
                                            Book Now <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Pricing Section */}
                        <section className="py-24 bg-[#F8FAFC] border-y border-slate-200 px-6">
                            <div className="max-w-7xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-950">Transparent Pricing.</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Mobilization Fee included for Bay Area</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                    {pricingPlans.map((plan, i) => (
                                        <div key={i} className={`p-10 rounded-[40px] border-2 transition-all relative flex flex-col ${plan.popular ? 'border-emerald-600 bg-white shadow-2xl shadow-emerald-100 scale-105 z-10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            {plan.popular && <div className="absolute top-0 center text-center w-full left-0 -translate-y-1/2"><span className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</span></div>}

                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">{plan.title}</h4>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mb-8">Per Unit / Inspection</p>

                                            <ul className="space-y-4 mb-10 flex-grow">
                                                {plan.features.map((f, j) => (
                                                    <li key={j} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => { setFormData({ ...formData, selectedPlan: plan }); setView('booking'); }}
                                                className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                            >
                                                Select Plan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {view === 'booking' && (
                    <section className="pt-10 pb-24 px-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-6">
                        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
                            <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black">Book Inspection</h2>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Step {step} of 4</p>
                                </div>
                                <button onClick={() => setView('landing')} className="text-slate-400 hover:text-white transition-colors"><X /></button>
                            </div>

                            <div className="p-10 flex-grow flex flex-col">
                                {/* Step 1: Location & Identity */}
                                {step === 1 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                                        <div>
                                            <h3 className="text-lg font-black mb-1">Service Location.</h3>
                                            <p className="text-xs text-slate-500 font-bold">Where should our tech meet the truck?</p>
                                        </div>

                                        <input type="text" placeholder="Full Name (Point of Contact)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                                        <input type="text" placeholder="Yard Address (Street)" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code & County</label>

                                            {/* Zip Input MOVED ABOVE MAP */}
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input type="text" placeholder="Enter ZIP Code" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" maxLength={5} value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                                {formData.county && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 animate-in fade-in">✓ {formData.county}</div>}
                                            </div>

                                            <BayAreaMap selectedCounty={formData.county} onSelect={(c) => setFormData({ ...formData, county: c })} />
                                        </div>

                                        <div className="space-y-2">
                                            <input type="text" placeholder="Gate Code / Special Instructions (Optional)" className="w-full p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl outline-none font-black text-base text-slate-900 placeholder:text-amber-600/60" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fleet Size</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['1', '2-10', '11-25', '25+'].map(s => (
                                                    <button key={s} onClick={() => setFormData({ ...formData, fleetSize: s })} className={`py-3 rounded-xl text-xs font-black transition-all ${formData.fleetSize === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exact Number of Trucks</label>
                                            <input type="number" min="1" placeholder="How many trucks need service?" className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm" value={formData.truckCount} onChange={e => setFormData({ ...formData, truckCount: e.target.value })} />
                                        </div>

                                        <button disabled={!formData.name || !formData.location || !formData.county || !formData.fleetSize || !formData.truckCount} onClick={() => setStep(2)} className="w-full bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-2xl font-black shadow-xl mt-4">Next Step</button>
                                    </div>
                                )}

                                {/* Step 2: Calendar */}
                                {step === 2 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                                        <div>
                                            <h3 className="text-lg font-black mb-1">Select Time.</h3>
                                            <p className="text-xs text-slate-500 font-bold mb-2">Availability for {formData.county} County.</p>
                                            <p className="text-sm font-black text-slate-900 bg-slate-100 inline-block px-3 py-1 rounded-lg">{calendarMonth}</p>
                                        </div>

                                        <div className="grid grid-cols-7 gap-2 mb-4">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-center text-slate-300">{d}</div>)}
                                            {calendarDates.map((d, i) => {
                                                if (!d) return <div key={i} className="p-2"></div>;
                                                return (
                                                    <button key={i} disabled={d.disabled} onClick={() => setFormData({ ...formData, selectedDate: d.fullDate, selectedTime: '' })} className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 ${formData.selectedDate === d.fullDate ? 'bg-emerald-600 text-white shadow-lg scale-105' : d.disabled ? 'opacity-10 grayscale bg-slate-100 text-slate-300 cursor-not-allowed pointer-events-none' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50'}`}>
                                                        <span>{d.day}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {TIME_SLOTS.map(t => {
                                                const busy = isSlotBusy(t);
                                                return (
                                                    <button disabled={busy} key={t} onClick={() => setFormData({ ...formData, selectedTime: t })} className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${formData.selectedTime === t ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : busy ? 'border-red-100 bg-red-50 text-red-300 line-through cursor-not-allowed' : 'border-slate-100 bg-white hover:border-emerald-200'}`}>{t}</button>
                                                )
                                            })}
                                        </div>

                                        <div className="flex gap-4 mt-auto">
                                            <button onClick={() => setStep(1)} className="px-6 py-5 bg-slate-50 rounded-2xl font-bold text-slate-500">Back</button>
                                            <button disabled={!formData.selectedDate || !formData.selectedTime} onClick={() => setStep(3)} className="flex-grow bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-2xl font-black shadow-xl">Review & Pay</button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Checkout */}
                                {step === 3 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-black tracking-tight">Review Booking</h2>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Total: ${calculateTotal()}.00</p>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</p>
                                                    <p className="text-sm font-bold text-slate-900">Clean Truck Inspection</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                                    <p className="text-sm font-bold text-slate-900">{formData.selectedDate} @ {formData.selectedTime}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                                <p className="text-sm font-bold text-slate-900">{formData.location}</p>
                                                <p className="text-xs font-medium text-slate-500">{formData.county}</p>
                                            </div>
                                        </div>

                                        {/* Price Summary */}
                                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-slate-600">{formData.truckCount || 1} truck{parseInt(formData.truckCount) > 1 ? 's' : ''} × ${getPricePerTruck(formData.truckCount)}/truck</span>
                                                <span className="text-sm font-bold text-slate-400">Tier: {parseInt(formData.truckCount) === 1 ? 'Standard' : parseInt(formData.truckCount) <= 10 ? 'Small Fleet' : 'Enterprise'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-black text-slate-900">Total</span>
                                                <span className="text-3xl font-black text-emerald-600">${calculateTotal()}</span>
                                            </div>
                                        </div>

                                        <button onClick={handleFinalBooking} className="w-full bg-black text-white py-6 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4">
                                            <span>Continue to Payment</span>
                                            <ArrowRight size={18} />
                                        </button>

                                        <p className="text-[9px] text-center text-slate-400 font-medium">
                                            Secure checkout via Stripe. Apple Pay, Google Pay, and Cards accepted.
                                        </p>

                                        <button onClick={() => setStep(2)} className="text-center text-[10px] font-bold text-slate-400 mt-2">Back to Calendar</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Quick Charge POS View */}
                {view === 'quickcharge' && (
                    <section className="pt-24 pb-24 px-6 min-h-screen">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Zap size={32} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Quick Charge</h2>
                                <p className="text-slate-500 text-sm mt-2">Point of Sale - No scheduling required</p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter customer name"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-base"
                                        value={quickChargeData.customerName}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, customerName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Trucks</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-base"
                                        value={quickChargeData.truckCount}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, truckCount: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="VIN, plate, or other notes"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm"
                                        value={quickChargeData.notes}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, notes: e.target.value })}
                                    />
                                </div>

                                {/* Price Summary */}
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-600">
                                            {quickChargeData.truckCount || 1} truck{parseInt(quickChargeData.truckCount) > 1 ? 's' : ''} × ${getPricePerTruck(quickChargeData.truckCount)}/truck
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-slate-900">Total</span>
                                        <span className="text-3xl font-black text-amber-600">
                                            ${(parseInt(quickChargeData.truckCount) || 1) * getPricePerTruck(quickChargeData.truckCount)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleQuickCharge}
                                    disabled={loading || !quickChargeData.customerName}
                                    className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Processing...' : 'Charge Now'}
                                    <ArrowRight size={18} />
                                </button>

                                <button onClick={() => setView('landing')} className="w-full text-center text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {view === 'success' && (
                    <section className="pt-24 pb-24 px-6 text-center animate-in zoom-in-95">
                        <div className="max-w-xl mx-auto">
                            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"><CheckCircle2 size={48} /></div>
                            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none">You're Booked.</h2>
                            <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Confirmed for <span className="text-slate-900 font-bold underline decoration-emerald-500">{formData.selectedDate} at {formData.selectedTime}</span>.</p>
                            <div className="bg-white border border-slate-100 p-10 rounded-[48px] text-left mb-10 shadow-xl relative overflow-hidden">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">What Happens Next</h4>
                                <ul className="space-y-6">
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                        <p className="text-xs font-bold text-slate-700">Dispatch is syncing this with the master business calendar.</p>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                        <p className="text-xs font-bold text-slate-700">An automated SMS dispatch alert is being sent to {formData.phone}.</p>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                        <p className="text-xs font-bold text-slate-700">Our mobile unit will arrive within a 30-minute window of your time.</p>
                                    </li>
                                </ul>
                            </div>
                            <button onClick={() => setView('landing')} className="text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:tracking-[0.2em] transition-all">Back to Home</button>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white py-24 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Truck size={20} /></div>
                            <span className="text-xl font-black tracking-tighter uppercase">GSCTC</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Bay Area Clean Truck Check Specialists</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">415.416.7565</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Goldenstatectc@gmail.com</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Open 7 Days — Mobile Dispatch</p>
                    </div>
                </div>
            </footer>

            <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; }
        `}</style>
        </div>
    );
};

export default App;
