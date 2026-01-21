"""
Enhanced EWallet SDK Documentation Generator with Playwright Support
This version offers better quality Mermaid diagrams using local rendering.

Requirements:
pip install reportlab requests pillow playwright
playwright install chromium
"""

import os
import base64
import requests
import hashlib
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.platypus import KeepTogether, ListFlowable, ListItem
from reportlab.lib import colors
from PIL import Image as PILImage

# Try to import playwright for better diagram rendering
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright not available. Using online mermaid.ink service.")
    print("   For better quality diagrams, install: pip install playwright")
    print("   Then run: playwright install chromium\n")

class EnhancedEWalletSDKDocGenerator:
    """Enhanced PDF generator with local Mermaid rendering support"""
    
    def __init__(self, output_filename="EWallet_Flutter_SDK_Architecture.pdf", use_playwright=True):
        self.output_filename = output_filename
        self.use_playwright = use_playwright and PLAYWRIGHT_AVAILABLE
        self.doc = SimpleDocTemplate(
            output_filename,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        self.story = []
        self.styles = getSampleStyleSheet()
        self.temp_files = []  # Track temp files for cleanup
        self._setup_custom_styles()
        
        if self.use_playwright:
            print("✅ Using Playwright for high-quality diagram rendering")
        else:
            print("📡 Using mermaid.ink API for diagram rendering")
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        if 'CustomTitle' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CustomTitle',
                parent=self.styles['Heading1'],
                fontSize=24,
                textColor=HexColor('#4CAF50'),
                spaceAfter=30,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            ))
        
        # Heading 2 style
        if 'CustomHeading2' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CustomHeading2',
                parent=self.styles['Heading2'],
                fontSize=16,
                textColor=HexColor('#2196F3'),
                spaceAfter=12,
                spaceBefore=12,
                fontName='Helvetica-Bold'
            ))
        
        # Heading 3 style
        if 'CustomHeading3' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CustomHeading3',
                parent=self.styles['Heading3'],
                fontSize=14,
                textColor=HexColor('#FF9800'),
                spaceAfter=10,
                spaceBefore=10,
                fontName='Helvetica-Bold'
            ))
        
        # Code style - use different name to avoid conflict
        if 'CodeBlock' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CodeBlock',
                parent=self.styles['Normal'],
                fontSize=9,
                fontName='Courier',
                textColor=HexColor('#263238'),
                backColor=HexColor('#F5F5F5'),
                leftIndent=20,
                rightIndent=20,
                spaceAfter=10,
                spaceBefore=10
            ))
        
        # Body text
        if 'CustomBody' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='CustomBody',
                parent=self.styles['Normal'],
                fontSize=11,
                alignment=TA_JUSTIFY,
                spaceAfter=12,
                leading=14
            ))
    
    def cleanup_temp_files(self):
        """Clean up all temporary image files"""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                print(f"Warning: Could not delete {temp_file}: {e}")
        self.temp_files = []
    
    def render_mermaid_with_playwright(self, mermaid_code, diagram_name):
        """Render Mermaid diagram using Playwright (higher quality)"""
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={'width': 1920, 'height': 1080})
                
                # Create HTML with Mermaid
                html_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
                    <style>
                        body {{ 
                            background: white; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center;
                            margin: 40px;
                        }}
                        #diagram {{ 
                            background: white;
                        }}
                    </style>
                </head>
                <body>
                    <div id="diagram" class="mermaid">
{mermaid_code}
                    </div>
                    <script>
                        mermaid.initialize({{ 
                            startOnLoad: true,
                            theme: 'default',
                            themeVariables: {{
                                fontSize: '16px'
                            }}
                        }});
                    </script>
                </body>
                </html>
                """
                
                page.set_content(html_content)
                page.wait_for_timeout(2000)  # Wait for rendering
                
                # Take screenshot
                img_path = f"temp_{diagram_name}.png"
                diagram_element = page.locator('#diagram')
                diagram_element.screenshot(path=img_path)
                
                browser.close()
                return img_path
                
        except Exception as e:
            print(f"  Playwright rendering failed: {str(e)}")
            return None
    
    def render_mermaid_online(self, mermaid_code, diagram_name):
        """Render Mermaid diagram using mermaid.ink API"""
        try:
            encoded = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('utf-8')
            url = f"https://mermaid.ink/img/{encoded}"
            
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                img_path = f"temp_{diagram_name}.png"
                with open(img_path, 'wb') as f:
                    f.write(response.content)
                return img_path
            else:
                print(f"  Online rendering failed: Status {response.status_code}")
                return None
                
        except Exception as e:
            print(f"  Online rendering error: {str(e)}")
            return None
    
    def render_mermaid_diagram(self, mermaid_code, diagram_name):
        """Render Mermaid diagram using best available method"""
        if self.use_playwright:
            img_path = self.render_mermaid_with_playwright(mermaid_code, diagram_name)
            if img_path:
                return img_path
            print("  Falling back to online rendering...")
        
        return self.render_mermaid_online(mermaid_code, diagram_name)
    
    def add_title_page(self):
        """Add title page"""
        self.story.append(Spacer(1, 2*inch))
        
        title = Paragraph("Cross-Platform Hybrid SDK Architecture", self.styles['CustomTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.3*inch))
        
        subtitle = Paragraph("Flutter-Angular eWallet Integration", self.styles['Heading2'])
        self.story.append(subtitle)
        self.story.append(Spacer(1, 0.5*inch))
        
        subtitle2 = Paragraph("Multi-Platform WebView Bridge SDK Pattern", self.styles['Heading3'])
        self.story.append(subtitle2)
        self.story.append(Spacer(1, 1*inch))
        
        overview = Paragraph(
            "A comprehensive guide to building a unified SDK that embeds Angular applications "
            "within Flutter apps across Android, iOS, Web, Windows, macOS, and Linux platforms "
            "using platform-specific WebView implementations and JavaScript-to-Native bridges.",
            self.styles['CustomBody']
        )
        self.story.append(overview)
        self.story.append(Spacer(1, 0.5*inch))
        
        date_text = Paragraph(
            f"<b>Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            self.styles['Normal']
        )
        self.story.append(date_text)
        self.story.append(Spacer(1, 0.2*inch))
        
        version = Paragraph("<b>Version:</b> 1.0.0", self.styles['Normal'])
        self.story.append(version)
        
        self.story.append(PageBreak())
    
    def add_section(self, title, content, level=2):
        """Add a section"""
        style_name = f'CustomHeading{level}' if f'CustomHeading{level}' in self.styles else 'Heading2'
        heading = Paragraph(title, self.styles[style_name])
        self.story.append(heading)
        self.story.append(Spacer(1, 0.15*inch))
        
        if isinstance(content, list):
            for paragraph in content:
                p = Paragraph(paragraph, self.styles['CustomBody'])
                self.story.append(p)
                self.story.append(Spacer(1, 0.1*inch))
        else:
            p = Paragraph(content, self.styles['CustomBody'])
            self.story.append(p)
        
        self.story.append(Spacer(1, 0.2*inch))
    
    def add_diagram(self, mermaid_code, caption, diagram_name):
        """Add diagram to PDF"""
        print(f"  Rendering: {caption}...")
        
        img_path = self.render_mermaid_diagram(mermaid_code, diagram_name)
        
        if img_path and os.path.exists(img_path):
            try:
                caption_para = Paragraph(f"<b>Figure: {caption}</b>", self.styles['CustomBody'])
                self.story.append(caption_para)
                self.story.append(Spacer(1, 0.1*inch))
                
                img = Image(img_path, width=6.5*inch, height=None, kind='proportional')
                self.story.append(img)
                self.story.append(Spacer(1, 0.2*inch))
                
                # Add to cleanup list instead of deleting immediately
                self.temp_files.append(img_path)
                print(f"  ✅ Added successfully")
                
            except Exception as e:
                print(f"  ❌ Error: {str(e)}")
        else:
            placeholder = Paragraph(
                f"<i>[Diagram: {caption} - Rendering failed]</i>",
                self.styles['Normal']
            )
            self.story.append(placeholder)
            self.story.append(Spacer(1, 0.2*inch))
            print(f"  ⚠️  Skipped (rendering failed)")
    
    def add_code_block(self, code, language="dart"):
        """Add code block"""
        lines = code.split('\n')
        formatted_lines = [line.replace('<', '&lt;').replace('>', '&gt;') for line in lines[:30]]
        
        if len(lines) > 30:
            formatted_lines.append("... (truncated)")
        
        code_text = '<br/>'.join(formatted_lines)
        code_para = Paragraph(f'<font name="Courier" size="8">{code_text}</font>', self.styles['CodeBlock'])
        self.story.append(code_para)
        self.story.append(Spacer(1, 0.15*inch))
    
    def generate_full_documentation(self):
        """Generate complete documentation"""
        print("\n📄 Generating PDF Documentation...")
        print("="*60)
        
        # Title Page
        print("\n[1/12] Adding title page...")
        self.add_title_page()
        
        # Architecture Overview
        print("[2/12] Adding architecture overview...")
        self.add_section(
            "1. Architecture Overview",
            [
                "This architecture pattern is called the <b>Cross-Platform Hybrid SDK Architecture with "
                "Platform-Specific Abstraction Layer</b> or <b>Multi-Platform WebView Bridge SDK Pattern</b>.",
                
                "It combines WebView embedding, JavaScript-to-Native bridges, and platform-specific "
                "implementations under a unified Dart API interface. The SDK functions as a Flutter Plugin "
                "Package that provides a single API interface while using different platform-specific "
                "implementations underneath.",
                
                "Your eWallet SDK will embed your Angular 19 application across all platforms (Android, iOS, "
                "Web, Desktop) while maintaining bidirectional communication through JavaScript bridges and "
                "preserving your existing Angular codebase without modifications."
            ]
        )
        
        # High-Level Diagram
        print("[3/12] Adding architecture diagram...")
        diagram1 = """
graph TB
    subgraph "Flutter Application"
        A[Flutter App<br/>Your New App] --> B[EWallet SDK<br/>Dart Interface]
    end
    
    subgraph "SDK Abstraction Layer"
        B --> C{Platform Detection}
        C -->|Android/iOS| D[WebView Implementation]
        C -->|Web| E[HtmlElementView Implementation]
        C -->|Desktop| F[Platform Channel Implementation]
    end
    
    subgraph "Platform-Specific Layer"
        D --> G[InAppWebView Plugin<br/>Mobile]
        E --> H[platformViewRegistry<br/>Web Only]
        F --> I[Native WebView<br/>Windows/macOS/Linux]
    end
    
    subgraph "Angular eWallet Application"
        G --> J[Angular 19 App<br/>Loaded in WebView]
        H --> J
        I --> J
    end
    
    subgraph "Communication Bridge"
        J <-->|JavaScript Bridge| K[window.flutter_inappwebview<br/>Mobile/Desktop]
        J <-->|postMessage| L[iframe Communication<br/>Web Only]
    end
    
    K --> B
    L --> B
"""
        self.add_diagram(diagram1, "High-Level Architecture Overview", "arch_overview")
        
        # Implementation Steps
        print("[4/12] Adding implementation steps...")
        self.add_section(
            "2. Implementation Steps",
            [
                "<b>Step 1: Create Flutter Plugin Package</b> - Use flutter create --template=plugin to create a multi-platform plugin package supporting Android, iOS, Web, Windows, macOS, and Linux.",
                
                "<b>Step 2: Define Platform-Agnostic Interface</b> - Create an abstract EWalletInterface class that defines methods like initialize(), initAuth(), openPaymentWindow(), logout(), and buildDashboard().",
                
                "<b>Step 3: Implement Conditional Platform Imports</b> - Use Dart's conditional imports (dart.library.io for mobile, dart.library.html for web) to automatically select correct implementation at compile time.",
                
                "<b>Step 4: Build Mobile Implementation</b> - Use flutter_inappwebview plugin to wrap native WebView components (WKWebView for iOS, AndroidWebView for Android) with JavaScript-to-Dart communication bridges.",
                
                "<b>Step 5: Build Web Implementation</b> - Use HtmlElementView with platformViewRegistry to embed HTML iframe elements, implementing communication via window.postMessage() API.",
                
                "<b>Step 6: Build Desktop Implementation</b> - Use InAppWebView with desktop support (WebView2 for Windows, WKWebView for macOS, WebKitGTK for Linux) for consistent cross-desktop experience."
            ]
        )
        
        # Mobile Flow
        print("[5/12] Adding mobile sequence diagram...")
        diagram2 = """
sequenceDiagram
    participant App as Flutter App
    participant SDK as EWallet SDK
    participant WV as InAppWebView
    participant Bridge as JavaScript Bridge
    participant Angular as Angular eWallet
    
    App->>SDK: initAuth(credentials)
    SDK->>SDK: Generate JWT token
    SDK->>WV: Create HeadlessInAppWebView
    WV->>Angular: GET /api.auth.client?auth=JWT
    Angular->>Angular: Validate JWT, Set cookies
    Angular-->>WV: Authentication successful
    WV-->>SDK: onLoadStop callback
    SDK->>WV: Dispose after 30s
    SDK-->>App: Auth completed
    
    App->>SDK: buildDashboard()
    SDK->>Bridge: Register JavaScript handlers
    SDK->>WV: Initialize visible WebView
    WV->>Angular: Load baseUrl
    Angular-->>WV: Return Angular SPA
    WV->>WV: Render Angular components
    SDK->>Angular: evaluateJavascript()<br/>Send client metadata
    
    App->>SDK: openPaymentWindow(orderId, token)
    SDK->>WV: Create modal WebView
    WV->>Angular: Load /paywindow
    Angular->>Bridge: callHandler('paymentSuccess')
    Bridge->>SDK: Trigger Dart callback
    SDK-->>App: Return PaymentResponse
"""
        self.add_diagram(diagram2, "Mobile Authentication and Payment Flow", "mobile_flow")
        
        # Code Example
        print("[6/12] Adding code examples...")
        self.add_section("3. Platform-Agnostic Interface Code", "")
        self.add_code_block("""abstract class EWalletInterface {
  Future<void> initialize({
    required String baseUrl,
    required String clientName,
  });
  
  Future<void> initAuth({
    required String clientName,
    required String clientId,
    required String clientSecret,
    required String userEmail,
  });
  
  Future<PaymentResponse> openPaymentWindow({
    required String orderId,
    required String token,
  });
  
  Future<void> logout();
  
  Widget buildDashboard({
    required String clientName,
  });
}""", "dart")
        
        self.add_section("4. SDK Usage Example", "")
        self.add_code_block("""// Initialize SDK
final ewallet = EWallet.create();
await ewallet.initialize(
  baseUrl: 'https://ewallet.example.com',
  clientName: 'MyApp',
);

// Authenticate user
await ewallet.initAuth(
  clientName: 'MyApp',
  clientId: 'client_123',
  clientSecret: 'secret_key',
  userEmail: 'user@example.com',
);

// Display dashboard in Flutter widget
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(title: Text('eWallet')),
    body: ewallet.buildDashboard(clientName: 'MyApp'),
  );
}

// Handle payment
try {
  final response = await ewallet.openPaymentWindow(
    orderId: 'order_123',
    token: 'payment_token_456',
  );
  print('Payment successful: ${response.transactionId}');
  showSuccess(response);
} catch (e) {
  print('Payment failed: $e');
  showError(e);
}""", "dart")
        
        # Platform Details
        print("[7/12] Adding platform details...")
        self.add_section(
            "5. Platform-Specific Implementation Details",
            [
                "<b>Android Implementation:</b> Uses android.webkit.WebView wrapped by InAppWebView plugin. JavaScript bridge established via addJavaScriptHandler(). Cookies managed through CookieManager for SSO session persistence. Payment modal displayed as full-screen Activity or Dialog fragment.",
                
                "<b>iOS Implementation:</b> Uses WKWebView (Apple's modern WebView). JavaScript bridge through window.webkit.messageHandlers wrapped by InAppWebView plugin. Cookies managed via WKWebsiteDataStore. Payment modal presented as new ViewController modally.",
                
                "<b>Web Implementation:</b> Uses standard HTML iframe element via dart:html library. Communication through window.postMessage() API for cross-origin messaging. iframe registered with ui_web.platformViewRegistry.registerViewFactory() to integrate into Flutter widget tree. Payment modal as absolute positioned div overlay with nested iframe.",
                
                "<b>Windows Desktop:</b> Uses Microsoft Edge WebView2 (Chromium-based) through InAppWebView plugin. JavaScript bridge same as mobile implementation. High performance with modern web standards support.",
                
                "<b>macOS Desktop:</b> Uses WKWebView (same as iOS) with InAppWebView plugin providing consistent API. Native performance with Apple's web rendering engine.",
                
                "<b>Linux Desktop:</b> Uses WebKitGTK for web rendering. InAppWebView plugin provides unified interface across all desktop platforms."
            ]
        )
        
        # State Management
        print("[8/12] Adding state management...")
        diagram3 = """
stateDiagram-v2
    [*] --> Uninitialized
    
    Uninitialized --> Initializing: SDK.initialize()
    Initializing --> Initialized: Platform detected
    
    Initialized --> Authenticating: initAuth()
    Authenticating --> Authenticated: JWT validated<br/>Cookies set
    
    Authenticated --> DashboardLoading: buildDashboard()
    DashboardLoading --> DashboardReady: Angular loaded<br/>Bridges established
    
    DashboardReady --> PaymentInitiated: openPaymentWindow()
    PaymentInitiated --> PaymentProcessing: User enters info
    
    PaymentProcessing --> PaymentSuccess: Payment confirmed
    PaymentProcessing --> PaymentError: Payment failed
    
    PaymentSuccess --> DashboardReady: Modal closed
    PaymentError --> DashboardReady: Error handled
    
    DashboardReady --> LoggingOut: logout()
    LoggingOut --> Initialized: Session cleared
    
    Initialized --> [*]: SDK disposed
"""
        self.add_diagram(diagram3, "SDK State Management Lifecycle", "states")
        
        # Communication Architecture
        print("[9/12] Adding communication architecture...")
        self.add_section(
            "6. Bidirectional Communication Architecture",
            [
                "<b>Mobile/Desktop Communication (InAppWebView):</b> Flutter SDK registers Dart callback handlers using addJavaScriptHandler() method. Angular application calls these handlers via window.flutter_inappwebview.callHandler('handlerName', data). Responses returned as JavaScript Promises. Flutter can send data to Angular using evaluateJavascript() method.",
                
                "<b>Web Communication (iframe + postMessage):</b> Flutter web SDK listens for messages using window.onMessage.listen(). Angular application posts messages via window.parent.postMessage(data, targetOrigin). Origin validation ensures security. Bidirectional messaging supports complex data structures through JSON serialization.",
                
                "<b>Event Types Supported:</b> paymentSuccess (transaction completed), paymentError (transaction failed), paymentProcessing (awaiting confirmation), closePaymentWindow (user cancelled), dashboardReady (UI loaded), authenticationComplete (session established)."
            ]
        )
        
        # Web Architecture
        print("[10/12] Adding web architecture...")
        diagram4 = """
graph TB
    subgraph "Flutter Web App"
        A[Flutter Widget Tree] --> B[EWallet SDK Web]
    end
    
    subgraph "Platform View"
        B --> C[platformViewRegistry]
        C --> D[Create iframe Element]
    end
    
    subgraph "Integration"
        D --> E[HtmlElementView Widget]
        E --> F[Render in Flutter Canvas]
    end
    
    subgraph "Angular App"
        F --> G[iframe loads Angular]
        G --> H[Angular 19 Rendered]
    end
    
    subgraph "Communication"
        B <-->|postMessage| I[window.postMessage API]
        I <-->|Origin validated| H
    end
"""
        self.add_diagram(diagram4, "Web Platform Architecture", "web_arch")
        
        # Distribution
        print("[11/12] Adding distribution pipeline...")
        diagram5 = """
graph LR
    A[SDK Development] --> B[flutter pub publish]
    B --> C[pub.dev Registry]
    C --> D[Consumer pubspec.yaml]
    D --> E{Platform Build}
    E -->|Android| F[APK with AAR]
    E -->|iOS| G[IPA with Framework]
    E -->|Web| H[JavaScript Bundle]
    E -->|Desktop| I[Native Binary]
    F --> J[User Device]
    G --> J
    H --> K[Browser]
    I --> L[Desktop PC]
    J --> M[Load Angular from Server]
    K --> M
    L --> M
"""
        self.add_diagram(diagram5, "SDK Distribution Pipeline", "distribution")
        
        self.add_section(
            "7. Package Distribution Process",
            [
                "<b>Step 1 - Development:</b> Create SDK package with all platform implementations in a single codebase. Use conditional imports to separate platform-specific code.",
                
                "<b>Step 2 - Publishing:</b> Run 'flutter pub publish' to upload package to pub.dev registry. Package includes all platform code but only relevant parts compiled for each target.",
                
                "<b>Step 3 - Consumer Integration:</b> Developers add your SDK to pubspec.yaml dependencies. Simple one-line dependency declaration pulls entire multi-platform SDK.",
                
                "<b>Step 4 - Platform Compilation:</b> When building for specific platform, Flutter compiler includes only relevant code. Android builds get AAR bundled in APK, iOS gets Framework in IPA, Web gets JavaScript, Desktop gets native binaries.",
                
                "<b>Step 5 - Runtime:</b> End users' devices/browsers load your Angular application from your server/CDN. SDK version independent of Angular version allows separate update cycles."
            ]
        )
        
        # Security & Best Practices
        print("[12/12] Adding security and conclusion...")
        self.add_section(
            "8. Security Considerations",
            [
                "<b>JWT Generation:</b> All JWT token generation happens in native Dart code, never exposed to JavaScript context. Uses crypto.subtle for HMAC-SHA256 signing. Tokens include expiry (30 seconds), not-before time, and session ID for enhanced security.",
                
                "<b>Authentication Isolation:</b> SSO authentication performed in hidden/headless WebView that auto-disposes after 30 seconds. Prevents token exposure in visible UI. Cookie-based sessions shared across WebViews on same domain.",
                
                "<b>Origin Validation:</b> Web implementation validates postMessage origin against configured baseUrl. Rejects messages from unauthorized origins. Prevents cross-site scripting attacks.",
                
                "<b>HTTPS Enforcement:</b> Production deployments should enforce HTTPS for all Angular app communications. WebView settings can block mixed content (HTTP resources on HTTPS pages).",
                
                "<b>Content Security Policy:</b> Angular application should implement strict CSP headers. WebView respects CSP, adding additional security layer."
            ]
        )
        
        self.add_section(
            "9. Key Architectural Principles",
            [
                "<b>1. Single Source of Truth:</b> EWalletInterface abstract class defines contract for all platforms. Ensures API consistency regardless of underlying implementation.",
                
                "<b>2. Compile-Time Platform Selection:</b> Conditional imports (dart.library.io, dart.library.html) enable compiler to include only relevant platform code. Results in smaller bundle sizes and faster load times.",
                
                "<b>3. Runtime Communication Abstraction:</b> Platform-specific messaging mechanisms (JavaScript handlers, postMessage) abstracted behind unified callback/stream API. Developers interact with consistent interface.",
                
                "<b>4. Angular Application Isolation:</b> Angular codebase remains completely unchanged. SDK acts as adapter layer, handling platform-specific integration details transparently.",
                
                "<b>5. Security by Default:</b> Sensitive operations (JWT generation, authentication) handled in native code. Auto-disposal of authentication components. Origin validation for cross-frame communication.",
                
                "<b>6. Performance Optimization:</b> Native WebView rendering on all platforms ensures optimal performance. Lazy loading of Angular application. Efficient communication through binary data transfer where supported."
            ]
        )
        
        self.add_section(
            "10. Conclusion",
            [
                "This Cross-Platform Hybrid SDK Architecture provides a robust, maintainable solution for integrating your Angular 19 eWallet application into Flutter apps across all major platforms.",
                
                "By leveraging platform-specific WebView components, JavaScript-to-Native bridges, and Dart's conditional imports, you achieve true cross-platform compatibility while preserving your existing Angular codebase.",
                
                "The architecture scales from mobile (Android/iOS) to web browsers to desktop applications (Windows/macOS/Linux) with a single unified API, making it easy for developers to integrate your eWallet functionality.",
                
                "<b>Next Steps:</b> Follow the implementation steps to create your Flutter plugin package, implement platform-specific adapters, test across all target platforms, and publish to pub.dev for distribution."
            ]
        )
        
        # Build PDF
        print("\n🔨 Building PDF...")
        try:
            self.doc.build(self.story)
            
            print("="*60)
            print(f"\n✅ PDF Generated Successfully!")
            print(f"📁 File: {self.output_filename}")
            print(f"📊 Size: {os.path.getsize(self.output_filename) / 1024:.2f} KB")
            print("="*60)
        finally:
            # Clean up temp files after PDF is built
            print("\n🧹 Cleaning up temporary files...")
            self.cleanup_temp_files()
            print("✅ Cleanup complete")

def main():
    """Main function"""
    print("\n" + "="*60)
    print("  EWallet Flutter SDK Documentation Generator")
    print("  Enhanced Edition with Playwright Support")
    print("="*60)
    
    # Check if we should use playwright
    use_playwright = PLAYWRIGHT_AVAILABLE
    
    generator = EnhancedEWalletSDKDocGenerator(use_playwright=use_playwright)
    generator.generate_full_documentation()
    
    print("\n✨ Documentation generation complete!\n")

if __name__ == "__main__":
    main()
