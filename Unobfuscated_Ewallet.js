/**
 * EWallet class provides authentication and logout functionality for the eWallet system.
 * This SDK is a streamlined version focusing solely on user authentication and session termination,
 * with all authentication logic consolidated into a single function for simplicity.
 *
 * @class EWallet
 */
class Ewallet {
    /**
     * Constructor initializes the SDK with configuration settings.
     * @param {Object} [config={}] - Configuration object.
     * @param {string} [config.baseUrl="https://dev-ewallet.bizionictech.com"] - Base URL for the eWallet API.
     */
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || "https://app.earnon.ai"
        this.paymentResponse = null;
        this.isVideoLoaded = false;

        // Preload webm video
        this.preloadWebmVideo();
    }
    /**
     * Preloads webm video when SDK is initialized
     */
    preloadWebmVideo() {
        // Create video element for preloading
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = 'https://s3.us-east-2.amazonaws.com/letwizard-asset/1761910432868-for_webm.webm';
        video.style.display = 'none';

        // Add to DOM to trigger preload
        document.body.appendChild(video);

        video.onloadeddata = () => {
            this.isVideoLoaded = true;
            // Remove from DOM once loaded
            if (video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };

        // Also use prefetch link for additional preloading
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = 'https://s3.us-east-2.amazonaws.com/letwizard-asset/1761910432868-for_webm.webm';
        link.as = 'video';
        link.type = 'video/webm';
        document.head.appendChild(link);
    }
    /**
     * Shows the loading animation
     */
    showLoadingAnimation() {
        if (document.getElementById('ewallet-loading')) return;
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'ewallet-loading';
        loadingContainer.style.position = 'fixed';
        loadingContainer.style.top = '0';
        loadingContainer.style.left = '0';
        loadingContainer.style.width = '100vw';
        loadingContainer.style.height = '100vh';
        loadingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        loadingContainer.style.display = '-webkit-flex';
        loadingContainer.style.display = '-ms-flexbox';
        loadingContainer.style.display = 'flex';
        loadingContainer.style.webkitJustifyContent = 'center';
        loadingContainer.style.msFlexPack = 'center';
        loadingContainer.style.justifyContent = 'center';
        loadingContainer.style.webkitAlignItems = 'center';
        loadingContainer.style.msFlexAlign = 'center';
        loadingContainer.style.alignItems = 'center';
        loadingContainer.style.zIndex = '10000';
        loadingContainer.style.webkitBackdropFilter = 'blur(2px)';
        loadingContainer.style.backdropFilter = 'blur(2px)';

        // Create video element for transparent webm
        const videoElement = document.createElement('video');
        videoElement.src = 'https://s3.us-east-2.amazonaws.com/letwizard-asset/1761910432868-for_webm.webm';
        videoElement.style.width = '300px';
        videoElement.style.height = '300px';
        videoElement.style.maxWidth = '80vw';
        videoElement.style.maxHeight = '80vh';
        videoElement.style.objectFit = 'contain';
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.playsInline = true;

        // Mobile responsiveness
        if (window.innerWidth <= 768) {
            videoElement.style.width = '200px';
            videoElement.style.height = '200px';
        }
        if (window.innerWidth <= 480) {
            videoElement.style.width = '150px';
            videoElement.style.height = '150px';
        }

        loadingContainer.appendChild(videoElement);
        document.body.appendChild(loadingContainer);

        // Handle window resize for mobile
        const resizeHandler = () => {
            if (window.innerWidth <= 480) {
                videoElement.style.width = '150px';
                videoElement.style.height = '150px';
            } else if (window.innerWidth <= 768) {
                videoElement.style.width = '200px';
                videoElement.style.height = '200px';
            } else {
                videoElement.style.width = '300px';
                videoElement.style.height = '300px';
            }
        };
        window.addEventListener('resize', resizeHandler);

        // Store resize handler for cleanup
        loadingContainer._resizeHandler = resizeHandler;
    }
    /**
     * Hides the loading animation
     */
    hideLoadingAnimation() {
        const loadingContainer = document.getElementById('ewallet-loading');
        if (loadingContainer) {
            // Remove resize event listener
            if (loadingContainer._resizeHandler) {
                window.removeEventListener('resize', loadingContainer._resizeHandler);
            }
            document.body.removeChild(loadingContainer);
        }
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
            sdkVersion: "1.0.0",
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
        // Load JWT in hidden iframe
        const authIframe = document.createElement("iframe");
        authIframe.id = "authIframe";
        authIframe.src = `${this.baseUrl}/api.auth.client?auth=${jwt}`;
        authIframe.frameBorder = "0";
        authIframe.style.display = "none";
        authIframe.style.width = "0";
        authIframe.style.height = "0";
        document.body.appendChild(authIframe);
        // Auto-destruct iframe after 30 seconds
        setTimeout(() => {
            if (authIframe.parentNode) {
                document.body.removeChild(authIframe);
                console.log("Auth iframe auto-destructed after expiry");
            }
        }, 30000);
    }
    /**
     * Logs out the user by loading a logout endpoint in a hidden iframe.
     * @returns {Promise<void>} Resolves when logout is initiated.
     */
    async logout() {
        const authIframe = document.createElement("iframe");
        authIframe.id = "authIframe";
        authIframe.src = `${this.baseUrl}/api.auth.logout`;
        authIframe.frameBorder = "0";
        authIframe.style.display = "none";
        authIframe.style.width = "0";
        authIframe.style.height = "0";
        document.body.appendChild(authIframe);
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
            alignItems: "center"
        };
        for (const key in styles) {
            iframe.style[key] = styles[key];
        }
        // Prepare client data
        const clientData = { client: clientName };
        // Send client data to iframe
        const sendData = () => {
            iframe.contentWindow.postMessage(clientData, this.baseUrl);
        };
        // Send data on load and with a 1-second fallback
        iframe.addEventListener('load', () => {
            sendData();
        });
        setTimeout(() => {
            sendData();
        }, 1000);
    }

    /**
     * Opens a payment window (V1) in a modal iframe and handles payment events.
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
        // Validate required parameters
        if (!orderId) throw new Error("orderId is required for payment window V1");
        if (!token) throw new Error("token is required for payment window V1");
        try {
            // Show loading animation
            this.showLoadingAnimation();
            // Create or reuse modal and iframe
            let modal = document.getElementById("ewallet-modal");
            let iframe = document.getElementById("ewallet-iframe");
            if (!modal) {
                modal = document.createElement("div");
                modal.id = "ewallet-modal";
                modal.style.position = "fixed";
                modal.style.top = "0";
                modal.style.left = "0";
                modal.style.width = "100vw";
                modal.style.height = "100vh";
                modal.style.backgroundColor = "rgba(0, 0, 0, 0.23)";
                modal.style.display = "none";
                modal.style.webkitJustifyContent = "center";
                modal.style.msFlexPack = "center";
                modal.style.justifyContent = "center";
                modal.style.webkitAlignItems = "center";
                modal.style.msFlexAlign = "center";
                modal.style.alignItems = "center";
                modal.style.zIndex = "9999";
                modal.style.webkitBackdropFilter = 'blur(2px)';
                modal.style.backdropFilter = 'blur(2px)';
                iframe = document.createElement("iframe");
                iframe.id = "ewallet-iframe";
                iframe.style.width = "100vw";
                iframe.style.height = "100vh";
                iframe.style.border = "none";
                iframe.style.colorScheme = "light";
                modal.appendChild(iframe);
                document.body.appendChild(modal);
            }
            // Set iframe source with query parameters
            const queryParams = new URLSearchParams({ orderId, token }).toString();
            iframe.src = `${this.baseUrl}/paywindow?${queryParams}`;
            // Hide loading animation and show modal when iframe loads
            iframe.onload = () => {
                this.hideLoadingAnimation();
                modal.style.display = "-webkit-flex";
                modal.style.display = "-ms-flexbox";
                modal.style.display = "flex";
            };
            // Fallback: hide loading animation after 5 seconds if iframe doesn't load
            setTimeout(() => {
                this.hideLoadingAnimation();
                modal.style.display = "-webkit-flex";
                modal.style.display = "-ms-flexbox";
                modal.style.display = "flex";
            }, 5000);
            // Handle payment events
            const messageHandler = (event) => {
                if (event.data === "closeIframe") {
                    modal.style.display = "none";
                    this.hideLoadingAnimation();
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
                    }
                    switch (event.data.type) {
                        case "paymentSuccess":
                            this.paymentResponse = { status: "success", data: event.data.data };
                            if (onSuccess) onSuccess(event.data.data);
                            modal.style.display = "none";
                            this.hideLoadingAnimation();
                            if (this.paymentPromise)
                                this.paymentPromise.resolve(event.data.data);
                            break;
                        case "paymentError":
                            this.paymentResponse = { status: "error", error: event.data.error };
                            if (onError) onError(event.data.error);
                            this.hideLoadingAnimation();
                            if (this.paymentPromise)
                                this.paymentPromise.reject(event.data.error);
                            break;
                        case "paymentProcessing":
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
            // Handle error internally and invoke callback
            this.hideLoadingAnimation();
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
}
