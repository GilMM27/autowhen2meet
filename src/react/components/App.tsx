const dogSrc: string = 'https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg';

const prueba = async () => {
    console.log('send');
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activateTab = tabs[0];
    chrome.tabs.sendMessage(activateTab.id || 0, dogSrc);
}

const App = () => {
    return (
        <main>
            <img src={dogSrc} />
            <button onClick={prueba}>jala??</button>
        </main>
    );
};

export default App;