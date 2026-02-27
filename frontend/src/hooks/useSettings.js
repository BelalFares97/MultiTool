import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export function useSettings() {
    const [clientName, setClientName] = useLocalStorage('clientName', 'Global Finance Corp');
    const [clientLogo, setClientLogo] = useLocalStorage('clientLogo', 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=128&h=128&fit=crop');
    const [userName, setUserName] = useLocalStorage('userName', 'Alex Thompson');
    const [userImage, setUserImage] = useLocalStorage('userImage', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop');
    const [language, setLanguage] = useLocalStorage('language', 'English');
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const [accentColor, setAccentColor] = useLocalStorage('accentColor', '#3b82f6');
    const [iconColor, setIconColor] = useLocalStorage('iconColor', '#64748b');
    const [navItems, setNavItems] = useLocalStorage('navItems', [
        { id: 'Dashboard', label: 'Dashboard', isVisible: true },
        { id: 'Tamkeen', label: 'Tamkeen', isVisible: true },
        { id: 'RafeeQ', label: 'RafeeQ', isVisible: true },
        { id: 'MudaQQiQ', label: 'MudaQQiQ', isVisible: true },
        { id: 'Mujaz', label: 'Mujaz', isVisible: true },
        { id: 'Cases', label: 'Cases', isVisible: true },
        { id: 'Miqyas Credit', label: 'Miqyas Credit', isVisible: true },
    ]);

    useEffect(() => {
        // Migration logic for old IDs and missing items
        const idMap = {
            'RMs Assistant': 'Tamkeen',
            'Conversational Doc': 'RafeeQ',
            'Risk Intelligence Unit': 'Miqyas Credit'
        };

        const defaultItems = [
            { id: 'Dashboard', label: 'Dashboard', isVisible: true },
            { id: 'Tamkeen', label: 'Tamkeen', isVisible: true },
            { id: 'RafeeQ', label: 'RafeeQ', isVisible: true },
            { id: 'MudaQQiQ', label: 'MudaQQiQ', isVisible: true },
            { id: 'Mujaz', label: 'Mujaz', isVisible: true },
            { id: 'Cases', label: 'Cases', isVisible: true },
            { id: 'Miqyas Credit', label: 'Miqyas Credit', isVisible: true },
        ];

        const hasOldIds = navItems.some(item => idMap[item.id]);
        const missingIds = defaultItems.filter(def => !navItems.some(item => item.id === def.id || idMap[item.id] === def.id));

        if (hasOldIds || missingIds.length > 0) {
            setNavItems(prev => {
                const updated = prev.map(item => ({
                    ...item,
                    id: idMap[item.id] || item.id,
                    label: idMap[item.id] || (item.label === item.id ? (idMap[item.id] || item.label) : item.label)
                }));

                // Add missing items that aren't in the renamed list
                missingIds.forEach(missing => {
                    if (!updated.some(u => u.id === missing.id)) {
                        updated.push(missing);
                    }
                });

                return updated;
            });
        }

        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('dir', language === 'Arabic' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language === 'Arabic' ? 'ar' : 'en');
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.documentElement.style.setProperty('--icon-color', iconColor);
    }, [language, theme, accentColor, iconColor, navItems, setNavItems]);

    const handleFileUpload = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return {
        clientName, setClientName,
        clientLogo, setClientLogo,
        userName, setUserName,
        userImage, setUserImage,
        language, setLanguage,
        theme, setTheme,
        accentColor, setAccentColor,
        iconColor, setIconColor,
        navItems, setNavItems,
        handleFileUpload
    };
}
