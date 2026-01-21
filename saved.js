/**
 * EWallet class provides authentication and logout functionality for the eWallet system.
 * This SDK is a streamlined version focusing solely on user authentication and session termination,
 * with all authentication logic consolidated into a single function for simplicity.
 * Now includes preloaded Lottie animations for faster payment window loading.
 *
 * @class EWallet
 */
class Ewallet {
    /**
     * Constructor initializes the SDK with configuration settings and preloads Lottie animation.
     * @param {Object} [config={}] - Configuration object.
     * @param {string} [config.baseUrl="http://localhost:4200"] - Base URL for the eWallet API.
     */
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || "http://localhost:4200";
        this.paymentResponse = null;
        this.lottieReady = false;
        this.preloadedLottieElement = null;
        this.sdkVersion = "2.0.0";
        
        // Preload Lottie animation immediately for faster payment window loading
        this.preloadLottieAnimation();
        
        console.log(`EWallet SDK v${this.sdkVersion} initialized with baseUrl: ${this.baseUrl}`);
    }

    /**
     * Preloads the Lottie library and animation for faster payment window loading.
     * This runs automatically when SDK is initialized.
     * 
     * @private
     */
    async preloadLottieAnimation() {
        try {
            console.log("EWallet SDK: Preloading Lottie animation...");
            
            // Load Lottie library first
            await this.loadLottieLibrary();
            
            // Create and cache the Lottie element
            await this.createPreloadedLottieElement();
            
            this.lottieReady = true;
            console.log("EWallet SDK: Lottie animation preloaded successfully");
        } catch (error) {
            console.warn("EWallet SDK: Failed to preload Lottie animation:", error);
            this.lottieReady = false;
        }
    }

    /**
     * Creates and caches the Lottie element for instant reuse.
     * 
     * @private
     */
    async createPreloadedLottieElement() {
        // Wait for custom element to be fully registered
        await new Promise(resolve => {
            if (window.customElements && window.customElements.get('dotlottie-wc')) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.customElements && window.customElements.get('dotlottie-wc')) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 10000);
            }
        });

        // Create the Lottie element
        this.preloadedLottieElement = document.createElement("dotlottie-wc");
        this.preloadedLottieElement.setAttribute("src", "https://lottie.host/795cf393-8eaa-4c7b-8f07-a3e988eb4fbd/v7nD16bIsb.lottie");
        this.preloadedLottieElement.style.cssText = `
            width: 300px;
            height: 300px;
            display: block;
            z-index: 10002;
        `;
        this.preloadedLottieElement.setAttribute("speed", "1");
        this.preloadedLottieElement.setAttribute("autoplay", "true");
        this.preloadedLottieElement.setAttribute("loop", "true");

        // Create a hidden container to preload the animation
        const hiddenContainer = document.createElement("div");
        hiddenContainer.id = "ewallet-lottie-preloader";
        hiddenContainer.style.cssText = `
            position: fixed;
            top: -2000px;
            left: -2000px;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
            z-index: -1000;
        `;
        
        // Clone element to preload animation data
        const preloadClone = this.preloadedLottieElement.cloneNode(true);
        hiddenContainer.appendChild(preloadClone);
        document.body.appendChild(hiddenContainer);

        // Clean up preloader after animation has had time to load
        setTimeout(() => {
            const preloader = document.getElementById("ewallet-lottie-preloader");
            if (preloader && preloader.parentNode) {
                document.body.removeChild(preloader);
                console.log("EWallet SDK: Cleaned up Lottie preloader");
            }
        }, 5000);
    }

    /**
     * Helper method to load Lottie library and wait for it to be ready.
     * 
     * @private
     * @returns {Promise<void>}
     */
    loadLottieLibrary() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.customElements && window.customElements.get('dotlottie-wc')) {
                resolve();
                return;
            }

            // Check if script already exists
            let existingScript = document.querySelector('script[src*="dotlottie-wc"]');
            
            if (existingScript) {
                // Wait for the custom element to be defined
                const checkForComponent = setInterval(() => {
                    if (window.customElements && window.customElements.get('dotlottie-wc')) {
                        clearInterval(checkForComponent);
                        resolve();
                    }
                }, 50);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkForComponent);
                    console.log("EWallet SDK: Lottie component check timeout");
                    resolve(); // Don't block the SDK
                }, 10000);
                return;
            }

            // Load the script
            const lottieScript = document.createElement('script');
            lottieScript.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.6.2/dist/dotlottie-wc.js";
            lottieScript.type = "module";
            
            lottieScript.onload = () => {
                console.log("EWallet SDK: Lottie script loaded");
                // Wait for custom element to be defined
                const checkForComponent = setInterval(() => {
                    if (window.customElements && window.customElements.get('dotlottie-wc')) {
                        console.log("EWallet SDK: Lottie web component ready");
                        clearInterval(checkForComponent);
                        resolve();
                    }
                }, 50);
                
                // Timeout fallback
                setTimeout(() => {
                    clearInterval(checkForComponent);
                    console.log("EWallet SDK: Lottie component timeout, proceeding anyway");
                    resolve();
                }, 5000);
            };
            
            lottieScript.onerror = () => {
                console.warn("EWallet SDK: Failed to load Lottie script");
                resolve(); // Don't reject, just continue without animation
            };
            
            document.head.appendChild(lottieScript);
        });
    }

    /**
     * Creates a CSS fallback spinner when Lottie is not ready.
     * 
     * @private
     * @param {HTMLElement} container - Container to append spinner to
     */
    createFallbackSpinner(container) {
        // Add CSS keyframes if not already added
        if (!document.getElementById('ewallet-spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'ewallet-spinner-styles';
            style.textContent = `
                @keyframes ewallet-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes ewallet-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }

        const spinnerElement = document.createElement("div");
        spinnerElement.style.cssText = `
            width: 60px;
            height: 60px;
            border: 6px solid rgba(255, 255, 255, 0.3);
            border-top: 6px solid #ffffff;
            border-radius: 50%;
            animation: ewallet-spin 1s linear infinite;
            margin-bottom: 20px;
        `;

        const loadingText = document.createElement("div");
        loadingText.style.cssText = `
            color: white;
            font-size: 18px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            text-align: center;
            font-weight: 500;
            animation: ewallet-pulse 2s ease-in-out infinite;
        `;
        loadingText.innerHTML = "Loading Payment...";

        const spinnerContainer = document.createElement("div");
        spinnerContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        spinnerContainer.appendChild(spinnerElement);
        spinnerContainer.appendChild(loadingText);
        container.appendChild(spinnerContainer);
    }

    /**
     * Initializes authentication by generating a JWT and loading it in a hidden iframe.
     * Combines all authentication steps (client data generation, JWT creation, and iframe handling)
     * into a single function. The iframe auto-destructs after 30 seconds for security.
     *
     * @param {Object} params - Authentication parameters.
     * @param {string} params.clientName - Name of the client.
     * @param {string} params.clientId - Unique client ID.
     * @param {string} params.clientSecret - Client secret for authentication.
     * @param {string} params.userEmail - User's email address.
     * @returns {Promise<void>} Resolves when authentication is initialized.
     * @throws {Error} If required parameters are missing or authentication fails.
     */
    async initAuth({ clientName, clientId, clientSecret, userEmail } = {}) {
        console.log("EWallet SDK: Initializing authentication...");
        
        // Validate required parameters
        if (!clientName) throw new Error("clientName is required for authentication");
        if (!clientId) throw new Error("clientId is required for authentication");
        if (!clientSecret) throw new Error("clientSecret is required for authentication");
        if (!userEmail) throw new Error("userEmail is required for authentication");

        // Generate client data
        const timestamp = Date.now();
        const expiry = timestamp + 30000; // 30 seconds expiry
        const nbf = timestamp - 5000; // Not before 5 seconds before current time
        const payload = {
            client: clientName,
            clientId: clientId,
            clientSecret: clientSecret,
            userEmail: userEmail,
            currentClientDomain: window.location.hostname,
            exp: expiry,
            iat: timestamp,
            nbf: nbf,
            timestamp: timestamp,
            sessionId: "sess_" + Math.random().toString(36).substr(2, 9),
            sdkVersion: this.sdkVersion,
            requestOrigin: window.location.href,
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
            },
        };

        // Helper: Base64 URL-encode a buffer
        const base64urlEncode = (buffer) => {
            return btoa(String.fromCharCode(...new Uint8Array(buffer)))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
        };

        // Helper: Base64 URL-encode a JSON object
        const base64urlEncodeJSON = (obj) => {
            const jsonStr = JSON.stringify(obj);
            return base64urlEncode(new TextEncoder().encode(jsonStr));
        };

        // Helper: Generate HMAC signature
        const generateHMAC = async (data, secret) => {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                "raw",
                encoder.encode(secret),
                { name: "HMAC", hash: "SHA-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
            return base64urlEncode(signature);
        };

        // Create JWT
        const header = {
            alg: "HS256",
            typ: "JWT",
            kid: "auth-key-1",
        };
        const encodedHeader = base64urlEncodeJSON(header);
        const encodedPayload = base64urlEncodeJSON(payload);
        const signature = await generateHMAC(`${encodedHeader}.${encodedPayload}`, clientSecret);
        const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

        // Clean up any existing auth iframe
        const existingAuthIframe = document.getElementById("ewallet-auth-iframe");
        if (existingAuthIframe) {
            document.body.removeChild(existingAuthIframe);
        }

        // Load JWT in hidden iframe
        const authIframe = document.createElement("iframe");
        authIframe.id = "ewallet-auth-iframe";
        authIframe.src = `${this.baseUrl}/api.auth.client?auth=${jwt}`;
        authIframe.frameBorder = "0";
        authIframe.style.cssText = `
            display: none;
            width: 0;
            height: 0;
            border: none;
            position: absolute;
            top: -1000px;
            left: -1000px;
        `;

        document.body.appendChild(authIframe);
        console.log("EWallet SDK: Authentication iframe loaded");

        // Auto-destruct iframe after 30 seconds
        setTimeout(() => {
            if (authIframe.parentNode) {
                document.body.removeChild(authIframe);
                console.log("EWallet SDK: Auth iframe auto-destructed after expiry");
            }
        }, 30000);
    }

    /**
     * Logs out the user by loading a logout endpoint in a hidden iframe.
     * @returns {Promise<void>} Resolves when logout is initiated.
     */
    async logout() {
        console.log("EWallet SDK: Initiating logout...");
        
        // Clean up any existing logout iframe
        const existingLogoutIframe = document.getElementById("ewallet-logout-iframe");
        if (existingLogoutIframe) {
            document.body.removeChild(existingLogoutIframe);
        }

        const logoutIframe = document.createElement("iframe");
        logoutIframe.id = "ewallet-logout-iframe";
        logoutIframe.src = `${this.baseUrl}/api.auth.logout`;
        logoutIframe.frameBorder = "0";
        logoutIframe.style.cssText = `
            display: none;
            width: 0;
            height: 0;
            border: none;
            position: absolute;
            top: -1000px;
            left: -1000px;
        `;
        
        document.body.appendChild(logoutIframe);
        console.log("EWallet SDK: Logout iframe loaded");

        // Auto-cleanup after 10 seconds
        setTimeout(() => {
            if (logoutIframe.parentNode) {
                document.body.removeChild(logoutIframe);
                console.log("EWallet SDK: Logout iframe cleaned up");
            }
        }, 10000);
    }

    /**
     * Initializes the dashboard by configuring an iframe and sending client data.
     * Combines all dashboard-related steps (iframe setup, styling, and data posting) into a single function.
     * Sends client data to the iframe's content window after load and with a fallback delay.
     *
     * @param {string} iframeId - The ID of the iframe element to initialize.
     * @param {string} clientName - Name of the client.
     * @returns {void}
     * @throws {Error} If clientName is missing or iframe is not found.
     */
    initialize(iframeId, clientName) {
        console.log(`EWallet SDK: Initializing dashboard for iframe: ${iframeId}`);
        
        // Validate required parameters
        if (!clientName) {
            throw new Error("clientName is required for initialization");
        }
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            throw new Error(`Iframe with ID ${iframeId} not found`);
        }

        // Configure iframe properties
        iframe.src = this.baseUrl;
        iframe.frameBorder = "0";
        const styles = {
            height: "100%",
            width: "100%",
            display: "grid",
            justifyContent: "center",
            alignItems: "center",
            border: "none"
        };
        for (const key in styles) {
            iframe.style[key] = styles[key];
        }

        // Prepare client data
        const clientData = { 
            client: clientName,
            sdkVersion: this.sdkVersion,
            timestamp: Date.now()
        };

        // Send client data to iframe
        const sendData = () => {
            try {
                iframe.contentWindow.postMessage(clientData, this.baseUrl);
                console.log("EWallet SDK: Client data sent to dashboard");
            } catch (error) {
                console.warn("EWallet SDK: Failed to send client data:", error);
            }
        };

        // Send data on load and with a 1-second fallback
        iframe.addEventListener('load', () => {
            console.log("EWallet SDK: Dashboard iframe loaded");
            sendData();
        });
        
        setTimeout(() => {
            sendData();
        }, 1000);
    }

    /**
     * Opens a payment window (V1) with preloaded Lottie loading animation.
     * Shows a beautiful loading animation with blur background until the payment window loads.
     * Combines all payment-related functionality (iframe setup, event handling, and callbacks)
     * into a single function. Dispatches custom events for payment outcomes.
     *
     * @param {Object} params - Payment parameters.
     * @param {string} params.orderId - The order ID from the order creation API.
     * @param {string} params.token - Authentication token for the payment window.
     * @param {Function} [params.onSuccess] - Callback for payment success with response data.
     * @param {Function} [params.onError] - Callback for payment error with error details.
     * @param {Function} [params.onProcessing] - Callback for payment processing with message.
     * @returns {Promise<void>} Resolves on successful payment, rejects on error.
     * @throws {Error} If orderId or token is missing or payment fails.
     */
    async openPayWindowV1({ orderId, token, onSuccess, onError, onProcessing } = {}) {
        console.log("EWallet SDK: Opening payment window V1...");
        
        // Validate required parameters
        if (!orderId) throw new Error("orderId is required for payment window V1");
        if (!token) throw new Error("token is required for payment window V1");

        try {
            // Create or reuse modal and iframe
            let modal = document.getElementById("ewallet-modal");
            let iframe = document.getElementById("ewallet-iframe");
            let loadingContainer = document.getElementById("ewallet-loading");

            if (!modal) {
                modal = document.createElement("div");
                modal.id = "ewallet-modal";
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 999999;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    transition: all 0.3s ease-in-out;
                `;

                // Create loading container with enhanced styling
                loadingContainer = document.createElement("div");
                loadingContainer.id = "ewallet-loading";
                loadingContainer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    z-index: 1000000;
                    transition: opacity 0.3s ease-in-out;
                `;

                // Use preloaded Lottie element or create fallback
                if (this.lottieReady && this.preloadedLottieElement) {
                    // Clone the preloaded element for instant display
                    const lottieClone = this.preloadedLottieElement.cloneNode(true);
                    loadingContainer.appendChild(lottieClone);
                    console.log("EWallet SDK: Using preloaded Lottie animation");
                } else {
                    // Fallback: CSS spinner if Lottie isn't ready
                    console.log("EWallet SDK: Lottie not ready, using CSS fallback");
                    this.createFallbackSpinner(loadingContainer);
                }

                iframe = document.createElement("iframe");
                iframe.id = "ewallet-iframe";
                iframe.style.cssText = `
                    width: 100vw;
                    height: 100vh;
                    border: none;
                    display: none;
                    z-index: 999999;
                    background: transperent;
                `;

                modal.appendChild(loadingContainer);
                modal.appendChild(iframe);
                document.body.appendChild(modal);

                console.log("EWallet SDK: Payment modal created");
            } else {
                // Reset existing elements
                loadingContainer = document.getElementById("ewallet-loading");
                if (loadingContainer) {
                    loadingContainer.style.display = "flex";
                    loadingContainer.style.opacity = "1";
                    
                    // Refresh the animation
                    if (this.lottieReady && this.preloadedLottieElement) {
                        loadingContainer.innerHTML = '';
                        const lottieClone = this.preloadedLottieElement.cloneNode(true);
                        loadingContainer.appendChild(lottieClone);
                        console.log("EWallet SDK: Refreshed preloaded Lottie animation");
                    }
                }
                iframe.style.display = "none";
            }

            // Set iframe source with query parameters
            const queryParams = new URLSearchParams({ orderId, token }).toString();
            iframe.src = `${this.baseUrl}/paywindow?${queryParams}`;
            modal.style.display = "flex";

            console.log(`EWallet SDK: Loading payment window with orderId: ${orderId}`);

            // Handle iframe load event to hide loading animation
            const handleIframeLoad = () => {
                console.log("EWallet SDK: Payment iframe loaded, hiding loading animation");
                if (loadingContainer) {
                    loadingContainer.style.opacity = "0";
                    setTimeout(() => {
                        loadingContainer.style.display = "none";
                    }, 300);
                }
                iframe.style.display = "block";
                iframe.removeEventListener('load', handleIframeLoad);
            };

            iframe.addEventListener('load', handleIframeLoad);

            // Enhanced fallback timeout with multiple attempts
            const fallbackTimeouts = [8000, 12000, 15000];
            fallbackTimeouts.forEach((timeout, index) => {
                setTimeout(() => {
                    if (loadingContainer && loadingContainer.style.display !== "none") {
                        console.log(`EWallet SDK: Fallback ${index + 1}: hiding loading animation after ${timeout}ms`);
                        loadingContainer.style.opacity = "0";
                        setTimeout(() => {
                            loadingContainer.style.display = "none";
                        }, 300);
                        iframe.style.display = "block";
                    }
                }, timeout);
            });

            // Handle payment events
            const messageHandler = (event) => {
                // Validate event origin for security
                if (event.origin !== this.baseUrl.replace(/\/+$/, '')) {
                    return; // Ignore messages from other origins
                }

                if (event.data === "closeIframe") {
                    console.log("EWallet SDK: Closing payment modal");
                    modal.style.display = "none";
                    window.removeEventListener("message", messageHandler);
                    return;
                }

                if (event.data && typeof event.data === "object") {
                    const eventName =
                        event.data.type === "paymentSuccess"
                            ? "payment_success"
                            : event.data.type === "paymentError"
                            ? "payment_error"
                            : event.data.type === "paymentProcessing"
                            ? "payment_processing"
                            : null;
                    
                    if (eventName) {
                        const customEvent = new CustomEvent(eventName, {
                            detail:
                                event.data.data ||
                                event.data.error ||
                                event.data.message,
                            bubbles: true,
                            cancelable: true,
                        });
                        document.dispatchEvent(customEvent);
                        console.log(`EWallet SDK: Dispatched ${eventName} event`);
                    }

                    switch (event.data.type) {
                        case "paymentSuccess":
                            console.log("EWallet SDK: Payment successful");
                            this.paymentResponse = { status: "success", data: event.data.data };
                            if (onSuccess) onSuccess(event.data.data);
                            modal.style.display = "none";
                            if (this.paymentPromise)
                                this.paymentPromise.resolve(event.data.data);
                            break;
                        case "paymentError":
                            console.log("EWallet SDK: Payment error");
                            this.paymentResponse = { status: "error", error: event.data.error };
                            if (onError) onError(event.data.error);
                            if (this.paymentPromise)
                                this.paymentPromise.reject(event.data.error);
                            break;
                        case "paymentProcessing":
                            console.log("EWallet SDK: Payment processing");
                            if (onProcessing) onProcessing(event.data.message);
                            break;
                    }
                }
            };

            window.addEventListener("message", messageHandler);

            return new Promise((resolve, reject) => {
                this.paymentPromise = { resolve, reject };
            });
        } catch (error) {
            console.error("EWallet SDK: Payment window error:", error);
            // Handle error internally and invoke callback
            this.paymentResponse = { status: "error", error: error };
            if (onError) onError(error);
            const event = new CustomEvent('payment_error', {
                detail: error,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(event);
            throw error;
        }
    }

    /**
     * Retrieves the latest payment response (success or error).
     * @returns {Object|null} Payment response ({ status: "success", data } or { status: "error", error }) or null if none.
     */
    getPaymentResponse() {
        return this.paymentResponse;
    }

    /**
     * Public method to manually refresh Lottie preloading if needed.
     * Useful if the initial preload failed and you want to retry.
     * 
     * @returns {Promise<void>}
     */
    async refreshLottiePreload() {
        console.log("EWallet SDK: Refreshing Lottie preload...");
        this.lottieReady = false;
        this.preloadedLottieElement = null;
        await this.preloadLottieAnimation();
    }

    /**
     * Gets the current SDK status and configuration.
     * Useful for debugging and monitoring.
     * 
     * @returns {Object} SDK status information
     */
    getSDKStatus() {
        return {
            version: this.sdkVersion,
            baseUrl: this.baseUrl,
            lottieReady: this.lottieReady,
            hasPaymentResponse: !!this.paymentResponse,
            timestamp: Date.now()
        };
    }

    /**
     * Cleans up any SDK-created elements (modal, iframes, etc.).
     * Useful for single-page applications when components are destroyed.
     * 
     * @returns {void}
     */
    cleanup() {
        console.log("EWallet SDK: Cleaning up...");
        
        // Clean up payment modal
        const modal = document.getElementById("ewallet-modal");
        if (modal && modal.parentNode) {
            document.body.removeChild(modal);
        }

        // Clean up auth iframe
        const authIframe = document.getElementById("ewallet-auth-iframe");
        if (authIframe && authIframe.parentNode) {
            document.body.removeChild(authIframe);
        }

        // Clean up logout iframe
        const logoutIframe = document.getElementById("ewallet-logout-iframe");
        if (logoutIframe && logoutIframe.parentNode) {
            document.body.removeChild(logoutIframe);
        }

        // Clean up lottie preloader
        const preloader = document.getElementById("ewallet-lottie-preloader");
        if (preloader && preloader.parentNode) {
            document.body.removeChild(preloader);
        }

        // Clean up styles
        const styles = document.getElementById("ewallet-spinner-styles");
        if (styles && styles.parentNode) {
            document.head.removeChild(styles);
        }

        // Reset properties
        this.paymentResponse = null;
        this.paymentPromise = null;
        
        console.log("EWallet SDK: Cleanup completed");
    }
}
