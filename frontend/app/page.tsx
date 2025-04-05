"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Key, Lock, Wallet, ArrowRight, CheckCircle } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-8 md:py-16 lg:py-24 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Introducing zkOTP Wallet
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl gradient-heading">
              <span className="block">Privacy-Focused Wallet with</span>
              <span className="block mt-2 sm:mt-3 md:mt-4 pb-2">Zero Knowledge Proofs</span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl pt-2">
              Secure your crypto assets with a wallet that uses Zero Knowledge Proofs and One-Time Passwords to ensure
              your privacy and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Button
                size="lg"
                className="rounded-full shadow-lg button-glow"
                onClick={() => handleNavigation("/create-wallet")}
              >
                Create Wallet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => {
                  const learnMoreSection = document.getElementById("learn-more")
                  if (learnMoreSection) {
                    learnMoreSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                Learn More
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="text-primary-600 font-bold text-3xl md:text-4xl">100%</div>
                <div className="text-sm text-muted-foreground">Privacy Focused</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-primary-600 font-bold text-3xl md:text-4xl">24/7</div>
                <div className="text-sm text-muted-foreground">Secure Access</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-primary-600 font-bold text-3xl md:text-4xl">0</div>
                <div className="text-sm text-muted-foreground">Data Leaks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-8 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-3 text-center mb-8">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-heading">
                Powerful Privacy Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Our wallet combines cutting-edge cryptography with user-friendly design to give you maximum control and
                privacy.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-6 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-3 rounded-2xl border p-6 shadow-lg card-hover">
              <div className="feature-icon-container">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Zero Knowledge Proofs</h3>
              <p className="text-center text-muted-foreground">
                Verify without revealing sensitive information using zero-knowledge cryptography.
              </p>
              <ul className="text-left w-full space-y-1.5 mt-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Enhanced privacy</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Secure verification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Data minimization</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center space-y-3 rounded-2xl border p-6 shadow-lg card-hover">
              <div className="feature-icon-container">
                <Key className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">One-Time Passwords</h3>
              <p className="text-center text-muted-foreground">
                Enhance security with time-based one-time passwords for every transaction.
              </p>
              <ul className="text-left w-full space-y-1.5 mt-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Two-factor authentication</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Time-based security</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Phishing protection</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center space-y-3 rounded-2xl border p-6 shadow-lg card-hover">
              <div className="feature-icon-container">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Local Key Storage</h3>
              <p className="text-center text-muted-foreground">
                Your OTP secrets are never stored on our servers, only on your trusted devices.
              </p>
              <ul className="text-left w-full space-y-1.5 mt-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Self-custody</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">No central point of failure</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Full user control</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="learn-more"
        className="w-full py-8 md:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950"
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 px-6 md:gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-heading">
                Secure by Design
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                The zkOTP wallet combines zero-knowledge proofs with one-time passwords to create a highly secure and
                private wallet experience. Your private keys never leave your device, and transaction verification
                happens without revealing sensitive information.
              </p>

              <div className="space-y-3 mt-2">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Create Your Wallet</h3>
                    <p className="text-muted-foreground">Set up your wallet with a secure OTP authenticator app.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Verify Transactions</h3>
                    <p className="text-muted-foreground">Use your OTP to securely authorize any transaction.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Maintain Privacy</h3>
                    <p className="text-muted-foreground">Zero-knowledge proofs ensure your data remains private.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Button
                  className="rounded-full shadow-lg button-glow"
                  onClick={() => handleNavigation("/create-wallet")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[250px] w-[250px] md:h-[350px] md:w-[350px] rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center shadow-glow animate-pulse-slow">
                <div className="absolute inset-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center animate-float">
                  <Wallet className="h-20 w-20 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="w-full py-8 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Trusted Security
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-heading">
                Built for the Future of Web3
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Join thousands of users who trust zkOTP Wallet for secure and private transactions.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">$2M+</div>
                <div className="text-sm text-muted-foreground">Assets Secured</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">50k+</div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Secure</div>
              </div>
            </div>

            <div className="mt-10">
              <Button
                size="lg"
                className="rounded-full shadow-lg button-glow"
                onClick={() => handleNavigation("/create-wallet")}
              >
                Start Secure Transactions Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

