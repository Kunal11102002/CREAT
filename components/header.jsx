"use client"


import { SignInButton, useAuth, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Authenticated, Unauthenticated } from 'convex/react'
import { BarLoader } from 'react-spinners'
import { useStoreUser } from '@/hooks/use-store-user'
import { Building, Crown, Plus, Ticket } from 'lucide-react'
import OnboardingModal, { } from './onboarding-modal'
import { useOnboarding } from '@/hooks/use-onboarding'
import SearchLocationBar from './search-location-bar'
import { Badge } from './ui/badge'
import UpgradeModal from './upgrade-modal'

'./search-location-bar'




const Header = () => {
    const { isLoading } = useStoreUser()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
        useOnboarding();

    const { has } = useAuth();
    const hasPro = has?.({ plan: "pro" });



    return (
        <>
            <nav className="fixed top-0 left-0 right-0  backdrop-blur-xl z-20 border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.jpg"
                            alt="Spott logo"
                            width={500}
                            height={500}
                            className="w-full h-11"
                            priority
                        />
                        {/* Pro badge */}
                        {hasPro && (
                            <Badge className="bg-linear-to-r from-pink-500 to-orange-500 gap-1 text-white ml-3">
                                <Crown className="w-3 h-3" />
                                Pro
                            </Badge>
                        )}


                    </Link>
                    {/* Search & Location - Desktop Only */}

                    {/* Right Side Actions */}
                    <div className="flex items-center">
                        {/* Show Pro badge or Upgrade button */}
                        {!hasPro && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowUpgradeModal(true)}
                            >
                                Pricing
                            </Button>
                        )}

                        <Button variant="ghost" size="sm" asChild className={"mr-2"}>
                            <Link href="/explore">Explore</Link>
                        </Button>




                        <Authenticated>
                            {/* create event button */}
                            <Button size="sm" asChild className="flex gap-2 mr-4">
                                <Link href="/create-event">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Create Event</span>
                                </Link>
                            </Button>

                            <UserButton>

                                <UserButton.MenuItems>
                                    <UserButton.Link
                                        label="My Events"
                                        labelIcon={<Building size={16} />}
                                        href="/my-events"
                                    />
                                    <UserButton.Link
                                        label="My Tickets"
                                        labelIcon={<Ticket size={16} />}
                                        href="/my-tickets"
                                    />
                                    <UserButton.Action label="manageAccount" />
                                </UserButton.MenuItems>
                            </UserButton>
                        </Authenticated>
                        <Unauthenticated>
                            <SignInButton mode="modal">
                                <Button size="sm">Sign In</Button>
                            </SignInButton>
                        </Unauthenticated>





                    </div>

                </div>
                {/* Mobile Search & Location - Below Header */}
                <div className="max-w-full flex justify-center  px-1 py-1">
                    <div className=" max-w-3xl px-2">
                        <SearchLocationBar />
                    </div>
                </div>





                {/*loader*/}
                {isLoading && (
                    <div className="absolute bottom-0 left-0 w-full">
                        <BarLoader width={"100%"} color="#a855f7" />
                    </div>
                )}
            </nav>
            {/*  Modal */}
            <OnboardingModal

                isOpen={showOnboarding}
                onClose={handleOnboardingSkip}
                onComplete={handleOnboardingComplete}
            />
             <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="header"
      />

        </>
    )
}

export default Header