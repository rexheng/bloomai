export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Authentication Error
        </h1>
        <p className="mt-4 text-xl">
          There was an error authenticating your user. Please try again.
        </p>
        <a href="/login" className="mt-6 text-blue-500 hover:text-blue-700 underline">
          Back to Login
        </a>
      </main>
    </div>
  )
}
