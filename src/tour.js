import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Initialize the guided tour for the application.
 */
export function initTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    popoverClass: 'driverjs-theme', // Custom class for styling
    steps: [
      { 
        element: '#help-trigger', 
        popover: { 
          title: 'START HERE', 
          description: 'Click this icon to access the new "ChatGPT Wrapped" prompt helper. Copy the prompt to generate your data!',
          side: 'left',
          align: 'start'
        } 
      },
      { 
        element: '#prompt-input', 
        popover: { 
          title: 'PASTE HERE', 
          description: 'Once you have the JSON result from ChatGPT, paste it here and hit Generate to see your Wrapped!',
          side: 'top',
          align: 'center'
        } 
      },
    ],
    onDestroyStarted: () => {
      // Mark tour as seen in localStorage
      localStorage.setItem('p2w_tour_seen', 'true');
      driverObj.destroy();
    },
  });

  // Check if tour has been seen
  const hasSeenTour = localStorage.getItem('p2w_tour_seen');
  
  if (!hasSeenTour) {
    // Small delay to ensure UI is ready
    setTimeout(() => {
      driverObj.drive();
    }, 1000);
  }

  // Return the driver object to allow manual trigger
  return driverObj;
}
