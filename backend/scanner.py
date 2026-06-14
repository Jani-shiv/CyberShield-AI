import re
import socket
import ssl
import urllib.parse
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import validators

class VulnerabilityScanner:
    def __init__(self, target_url):
        # Sanitize target URL to ensure format http/https
        if not target_url.startswith(('http://', 'https://')):
            target_url = 'https://' + target_url
        self.target_url = target_url
        self.parsed_url = urllib.parse.urlparse(self.target_url)
        self.domain = self.parsed_url.netloc.split(':')[0]
        self.scanned_items = []
        self.risk_score = 0
        self.vulns_found = []
        self.headers_result = {}
        self.ssl_result = {}
        self.ports_result = []

    def perform_scan(self):
        # 1. Basic URL Validator
        if not validators.url(self.target_url):
            return {
                'success': False,
                'error': 'Invalid target URL address format'
            }

        # Try to make connection
        try:
            response = requests.get(self.target_url, timeout=7, headers={'User-Agent': 'CyberShield-AI-Vulnerability-Scanner/1.0'})
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Failed to establish connection to target site: {str(e)}'
            }

        # 2. SSL/HTTPS check
        self.check_ssl()

        # 3. Security headers check
        self.check_headers(response.headers)

        # 4. Form detection & SQLi / XSS Checks
        self.check_forms_and_vulns(response.text)

        # 5. Open Redirect check
        self.check_open_redirect()

        # 6. Directory Enumeration
        self.enumerate_directories()

        # 7. TCP Port Scanner
        self.scan_ports()

        # 8. Compute total risk
        self.compute_risk_score()

        return {
            'success': True,
            'target_url': self.target_url,
            'domain': self.domain,
            'risk_score': self.risk_score,
            'risk_level': self.get_risk_level(),
            'timestamp': datetime.utcnow().isoformat(),
            'ssl_check': self.ssl_result,
            'headers_check': self.headers_result,
            'vulnerabilities': self.vulns_found,
            'ports_scan': self.ports_result
        }

    def check_ssl(self):
        is_https = self.parsed_url.scheme == 'https'
        self.ssl_result = {
            'enabled': is_https,
            'valid': False,
            'issuer': 'Unknown',
            'expiration': 'N/A',
            'details': 'HTTPS is not enabled for this site'
        }

        if is_https:
            try:
                context = ssl.create_default_context()
                with socket.create_connection((self.domain, 443), timeout=4) as sock:
                    with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                        cert = ssock.getpeercert()
                        
                        # Parse issuer
                        issuer_dict = dict(x[0] for x in cert.get('issuer', []))
                        issuer = issuer_dict.get('commonName', 'Unknown')
                        
                        # Parse expiration
                        not_after_str = cert.get('notAfter')
                        if not_after_str:
                            expiration_date = datetime.strptime(not_after_str, '%b %d %H:%M:%S %Y %Z')
                            expiration_str = expiration_date.strftime('%Y-%m-%d %H:%M:%S')
                            days_remaining = (expiration_date - datetime.utcnow()).days
                            valid = days_remaining > 0
                        else:
                            expiration_str = 'Unknown'
                            valid = True
                            days_remaining = 0

                        self.ssl_result = {
                            'enabled': True,
                            'valid': valid,
                            'issuer': issuer,
                            'expiration': expiration_str,
                            'days_remaining': max(0, days_remaining),
                            'details': f'SSL Cert is valid. Issued by: {issuer}. Expires: {expiration_str}.'
                        }
            except Exception as e:
                self.ssl_result = {
                    'enabled': True,
                    'valid': False,
                    'issuer': 'Error loading details',
                    'expiration': 'Error loading details',
                    'details': f'Failed to retrieve SSL/TLS Certificate details: {str(e)}'
                }

    def check_headers(self, headers):
        headers_to_check = {
            'Content-Security-Policy': {
                'description': 'Mitigates XSS and clickjacking attacks',
                'risk': 'Medium',
                'deduction': 15
            },
            'Strict-Transport-Security': {
                'description': 'Forces secure HTTPS connections',
                'risk': 'Medium',
                'deduction': 10
            },
            'X-Frame-Options': {
                'description': 'Protects against clickjacking vulnerabilities',
                'risk': 'Low',
                'deduction': 5
            },
            'X-Content-Type-Options': {
                'description': 'Prevents mime-type sniffing',
                'risk': 'Low',
                'deduction': 5
            },
            'Referrer-Policy': {
                'description': 'Controls referrer header information leakages',
                'risk': 'Low',
                'deduction': 5
            },
            'Permissions-Policy': {
                'description': 'Restricts access to browser APIs/hardware features',
                'risk': 'Low',
                'deduction': 5
            }
        }

        self.headers_result = {}
        for header, info in headers_to_check.items():
            present = header in headers
            self.headers_result[header] = {
                'present': present,
                'value': headers.get(header, 'Missing'),
                'risk': info['risk'] if not present else 'None',
                'description': info['description'],
                'deduction': info['deduction'] if not present else 0
            }

    def check_forms_and_vulns(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        forms = soup.find_all('form')
        
        # SQL Injection Checks (Simulated query check on inputs)
        sqli_payloads = ["'", "OR 1=1--", "admin'--"]
        xss_payloads = ["<script>alert(1)</script>", "javascript:alert(1)", "<img src=x onerror=alert(1)>"]

        # If forms are found, let's analyze inputs and test parameters
        if forms:
            for form in forms:
                action = form.get('action') or ''
                method = (form.get('method') or 'get').lower()
                inputs = form.find_all('input')
                
                # Check for forms missing CSRF Token protection
                has_csrf = False
                for inp in inputs:
                    name = (inp.get('name') or '').lower()
                    if any(term in name for term in ['csrf', 'token', 'xsrf', '_token']):
                        has_csrf = True
                        break

                if not has_csrf:
                    self.vulns_found.append({
                        'type': 'CSRF Protection Missing',
                        'severity': 'Medium',
                        'endpoint': urllib.parse.urljoin(self.target_url, action),
                        'description': 'Form detected without explicit anti-CSRF token fields. Attacks can spoof form submissions.',
                        'remediation': 'Implement secure CSRF tokens for all form-based state changes (e.g. CSRF cookies or cryptographically signed session tokens).'
                    })

                # SQL Injection vulnerability scanning
                # Check for query strings / search endpoints
                self.vulns_found.append({
                    'type': 'Potential Input Injection Endpoint',
                    'severity': 'Low',
                    'endpoint': urllib.parse.urljoin(self.target_url, action),
                    'description': f"Active user inputs found in form targeting: '{action}'. Dynamic queries may be vulnerable to SQLi or command injections.",
                    'remediation': 'Sanitize and bind all user input inputs. Implement Parameterized Queries / ORM statements.'
                })

        # Safe Simulated checking of URL parameter vulnerabilities
        url_params = urllib.parse.parse_qs(self.parsed_url.query)
        if url_params:
            for param in url_params.keys():
                # Let's perform a safety check by querying the endpoint with a test payload
                for payload in sqli_payloads:
                    test_url = self.target_url.replace(f"{param}={url_params[param][0]}", f"{param}={payload}")
                    try:
                        resp = requests.get(test_url, timeout=3)
                        # Look for common database syntax errors
                        db_errors = [
                            "you have an error in your sql syntax",
                            "unclosed quotation mark after the character string",
                            "mysql_fetch_array() expects parameter",
                            "sqlite3::prepare()",
                            "postgresql query failed"
                        ]
                        if any(err in resp.text.lower() for err in db_errors):
                            self.vulns_found.append({
                                'type': 'SQL Injection Vulnerability',
                                'severity': 'Critical',
                                'endpoint': test_url,
                                'description': f"Injecting SQL payloads into query parameter '{param}' triggered database-related errors.",
                                'remediation': 'Use parameterized prepared statements. Ensure all inputs are strictly typed and validation rules are configured.'
                            })
                            break
                    except Exception:
                        pass

                # XSS vulnerability checks
                for payload in xss_payloads:
                    test_url = self.target_url.replace(f"{param}={url_params[param][0]}", f"{param}={urllib.parse.quote(payload)}")
                    try:
                        resp = requests.get(test_url, timeout=3)
                        if payload in resp.text:
                            self.vulns_found.append({
                                'type': 'Reflected Cross-Site Scripting (XSS)',
                                'severity': 'High',
                                'endpoint': test_url,
                                'description': f"Parameter '{param}' was reflected directly into the HTML response without output encoding.",
                                'remediation': 'Implement context-aware HTML output encoding (e.g., escape special characters like <, >, &, \', and ").'
                            })
                            break
                    except Exception:
                        pass

    def check_open_redirect(self):
        # Scan for redirect parameters
        redirect_params = ['redirect', 'url', 'next', 'dest', 'destination', 'return_to', 'target']
        url_params = urllib.parse.parse_qs(self.parsed_url.query)
        
        for param in url_params.keys():
            if param.lower() in redirect_params:
                # Test reflecting a external domain payload
                payload = "https://evil.com"
                test_url = self.target_url.replace(f"{param}={url_params[param][0]}", f"{param}={urllib.parse.quote(payload)}")
                
                try:
                    # Do not follow redirects automatically so we can inspect headers
                    resp = requests.get(test_url, timeout=3, allow_redirects=False)
                    location = resp.headers.get('Location', '')
                    if location == payload or payload in location:
                        self.vulns_found.append({
                            'type': 'Open Redirect Vulnerability',
                            'severity': 'Medium',
                            'endpoint': test_url,
                            'description': f"Redirect parameter '{param}' redirects to external destination without validation.",
                            'remediation': 'Avoid user-defined redirect targets. If necessary, whitelist authorized local URLs and validate redirection destinations.'
                        })
                except Exception:
                    pass

    def enumerate_directories(self):
        common_paths = ['/admin', '/login', '/dashboard', '/config', '/backup', '/.git', '/wp-admin', '/phpmyadmin']
        for path in common_paths:
            check_url = urllib.parse.urljoin(self.target_url, path)
            try:
                resp = requests.head(check_url, timeout=2, headers={'User-Agent': 'CyberShield-AI-Vulnerability-Scanner/1.0'})
                # If path exists or returns 403 (unauthorized but path present), report it
                if resp.status_code in [200, 301, 302, 403]:
                    self.vulns_found.append({
                        'type': 'Sensitive Directory/File Exposed',
                        'severity': 'Low' if resp.status_code in [403] else 'Medium',
                        'endpoint': check_url,
                        'description': f"Exposed endpoint '{path}' returned status code {resp.status_code}.",
                        'remediation': 'Restrict path access using server-level configurations. Disable directory browsing and set proper authorization policies.'
                    })
            except Exception:
                pass

    def scan_ports(self):
        ports_to_check = {
            21: {'service': 'FTP', 'default_risk': 'High'},
            22: {'service': 'SSH', 'default_risk': 'Low'},
            23: {'service': 'Telnet', 'default_risk': 'Critical'},
            25: {'service': 'SMTP', 'default_risk': 'Medium'},
            53: {'service': 'DNS', 'default_risk': 'Low'},
            80: {'service': 'HTTP', 'default_risk': 'Low'},
            443: {'service': 'HTTPS', 'default_risk': 'None'},
            3306: {'service': 'MySQL', 'default_risk': 'High'},
            5432: {'service': 'PostgreSQL', 'default_risk': 'High'},
            6379: {'service': 'Redis', 'default_risk': 'High'}
        }

        self.ports_result = []

        # Safe socket port scanner fallback. Avoids crash on hosts without nmap binary
        for port, info in ports_to_check.items():
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.6)
            result = sock.connect_ex((self.domain, port))
            if result == 0:
                # Open Port detected
                status = 'Open'
                risk = info['default_risk']
                
                # If critical ports like Telnet, FTP, or Database ports are open to the WAN, flag it in vulnerabilities
                if risk in ['High', 'Critical']:
                    self.vulns_found.append({
                        'type': f"Open Database/Management Port ({port})",
                        'severity': risk,
                        'endpoint': f"{self.domain}:{port}",
                        'description': f"Port {port} offering service {info['service']} is publicly accessible.",
                        'remediation': f"Restrict port access to authorized IPs. Set firewalls (e.g. UFW, AWS security groups) or disable external listening."
                    })
            else:
                status = 'Closed'
                risk = 'None'
                
            self.ports_result.append({
                'port': port,
                'service': info['service'],
                'status': status,
                'risk': risk
            })
            sock.close()

    def compute_risk_score(self):
        # Start at 0 risk score
        score = 0

        # Max HTTPS deduction: 15 points
        if not self.ssl_result.get('enabled'):
            score += 15
        elif not self.ssl_result.get('valid'):
            score += 10

        # Header deductions: up to 45 points
        for header, detail in self.headers_result.items():
            score += detail.get('deduction', 0)

        # Vulnerabilities found: up to 40 points
        severity_weight = {
            'Low': 5,
            'Medium': 10,
            'High': 20,
            'Critical': 30
        }
        for vuln in self.vulns_found:
            score += severity_weight.get(vuln['severity'], 0)

        # Cap score between 0 and 100
        self.risk_score = min(score, 100)

    def get_risk_level(self):
        if self.risk_score >= 75:
            return 'Critical'
        elif self.risk_score >= 45:
            return 'High'
        elif self.risk_score >= 20:
            return 'Medium'
        else:
            return 'Low'
