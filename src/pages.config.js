import AIAssistant from './pages/AIAssistant';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import Events from './pages/Events';
import Home from './pages/Home';
import MLPredictions from './pages/MLPredictions';
import ScanDetails from './pages/ScanDetails';
import Sources from './pages/Sources';
import ThreatIntelligence from './pages/ThreatIntelligence';
import ThreatScanner from './pages/ThreatScanner';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "Alerts": Alerts,
    "Analytics": Analytics,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "Events": Events,
    "Home": Home,
    "MLPredictions": MLPredictions,
    "ScanDetails": ScanDetails,
    "Sources": Sources,
    "ThreatIntelligence": ThreatIntelligence,
    "ThreatScanner": ThreatScanner,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};