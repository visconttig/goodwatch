import React, { Fragment } from 'react'
import { useLocation } from 'react-router'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import Search from '~/ui/Search'
import { useVerifyAuthToken, useSession, useSupabase } from '~/utils/auth'

import logo from '~/img/goodwatch-logo.png'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const googleLogo = (
  <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
    <path
      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
      fill="#EA4335"
    />
    <path
      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
      fill="#4285F4"
    />
    <path
      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
      fill="#FBBC05"
    />
    <path
      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
      fill="#34A853"
    />
  </svg>
)

export default function Header() {
  const location = useLocation()
  const isDiscover = location.pathname == '/discover'

  const {supabase} = useSupabase()
  const session = useSession()
  const {user} = session || {}

  const handleSignInWithGoogle = () => {
    if (!supabase) return

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
      },
    })
  }

  const handleSignOut = async () => {
    if (!supabase) return

    const {error} = await supabase.auth.signOut()
    if (error) console.error(error)
  }

  return (
    <Disclosure as="nav" className="bg-gray-800 fixed top-0 z-50 w-full">
      {({open}) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex items-center px-2 lg:px-0">
                <div className="flex-shrink-0">
                  <a href="/">
                    <img
                      className="h-10 w-auto"
                      src={logo}
                      alt="GoodWatch Logo"
                    />
                  </a>
                </div>
                <a href="/">
                  <h1 className="brand-header hidden md:block ml-2 text-2xl text-gray-100">GoodWatch</h1>
                </a>
                <div className="hidden lg:ml-6 lg:block">
                  <div className="flex space-x-4">
                    <a href="/discover"
                       className={`rounded-md px-3 py-2 text-md font-semibold ${isDiscover ? 'text-white bg-indigo-800' : 'text-gray-300'} hover:bg-indigo-900 hover:text-white`}>
                      Discover
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="w-full max-w-lg lg:max-w-xl">
                  <Search/>
                </div>
              </div>
              <div className="lg:ml-4">
                <div className="flex items-center">
                  {session && user ? (
                    <>
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-4 flex-shrink-0">
                        <div>
                          <Menu.Button
                            className="flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={user.user_metadata.avatar_url}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items
                            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-950 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {/*<Menu.Item>*/}
                            {/*  {({active}) => (*/}
                            {/*    <a*/}
                            {/*      href="#"*/}
                            {/*      className={classNames(*/}
                            {/*        active ? 'bg-gray-100' : '',*/}
                            {/*        'block px-4 py-2 text-sm text-gray-700'*/}
                            {/*      )}*/}
                            {/*    >*/}
                            {/*      Your Profile*/}
                            {/*    </a>*/}
                            {/*  )}*/}
                            {/*</Menu.Item>*/}
                            {/*<Menu.Item>*/}
                            {/*  {({active}) => (*/}
                            {/*    <a*/}
                            {/*      href="#"*/}
                            {/*      className={classNames(*/}
                            {/*        active ? 'bg-gray-100' : '',*/}
                            {/*        'block px-4 py-2 text-sm text-gray-700'*/}
                            {/*      )}*/}
                            {/*    >*/}
                            {/*      Settings*/}
                            {/*    </a>*/}
                            {/*  )}*/}
                            {/*</Menu.Item>*/}
                            <Menu.Item>
                              {({active}) => (
                                <a
                                  href="#"
                                  onClick={handleSignOut}
                                  className={classNames(
                                    active ? 'text-white' : 'text-gray-300',
                                    'block px-4 py-2 text-sm hover:bg-gray-800 hover:text-white',
                                  )}
                                >
                                  Sign out
                                </a>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <a
                      href="#"
                      onClick={handleSignInWithGoogle}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 font-semibold text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                    >
                      {googleLogo}
                      Sign In
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <Disclosure.Button
                as="a"
                href="/discover"
                className={`block rounded-md px-3 py-2 text-base font-medium ${isDiscover ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              >
                Discover
              </Disclosure.Button>
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="space-y-1 px-2 pt-2 pb-3">
                <Disclosure.Button
                  as="a"
                  href="https://dev.to/t/goodwatch"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isDiscover ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  Blog
                </Disclosure.Button>
              </div>
              <div className="space-y-1 px-2 pt-2 pb-3">
                <Disclosure.Button
                  as="a"
                  href="/about"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isDiscover ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  About
                </Disclosure.Button>
              </div>
              <div className="space-y-1 px-2 pt-2 pb-3">
                <Disclosure.Button
                  as="a"
                  href="/disclaimer"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isDiscover ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  Disclaimer
                </Disclosure.Button>
              </div>
              <div className="space-y-1 px-2 pt-2 pb-3">
                <Disclosure.Button
                  as="a"
                  href="http://coinmatica.net:4801/status/goodwatch"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isDiscover ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  Status Page
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}