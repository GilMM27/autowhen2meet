const App = () => {
    function test() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'clickYouTime' });
            }
        });
    }
    return (
        <main className="w-32 h-32">
            <button onClick={test}>Test</button>
        </main>
    );
};

export default App;