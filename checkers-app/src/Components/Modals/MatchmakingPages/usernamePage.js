import { DialogTitle } from '@headlessui/react';
import { Filter } from 'bad-words';

export default function UsernamePage({ username, setUsername, setStartGamePage }) {

  const filter = new Filter();

  function handleContinue() {
    setUsername(filter.clean(username));
    setStartGamePage(4);
  }

  return (
    <>
      <div className="text-center">
        <DialogTitle as="h3" className="text:base sm:text-xl font-semibold leading-6 text-gray-100 inline-flex">
          Enter Your Name
        </DialogTitle>
        <div className="mt-2">
          <p className="text-sm text-gray-400"> 
            Enter a name to display to other players.
          </p>
        </div>
      </div>

      <div className="w-full mt-4">
        <div className="relative">
          <label htmlFor="name-input" className="sr-only">Name Input</label>
          <input
            id="name-input"
            type="text"
            placeholder="Username"
            maxLength="7"
            value={username}
            className="border border-gray-600 bg-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-2 placeholder-gray-400"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleContinue();
              }
            }}
          />
          {/* <p className="text-red-500 mt-1 text-sm">Invalid Name</p> */}
        </div>
        <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 w-full mx-auto">
          <button
            type="button"
            onClick={() => setStartGamePage(1)}
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-1"
          >
            Back
          </button>
          <button
            type="button"
            // onClick={() => setStartGamePage(4)}
            onClick={() => handleContinue()}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:col-start-2 sm:mt-0"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}