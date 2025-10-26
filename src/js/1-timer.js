import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const startBtn = document.querySelector('[data-start]');
const input = document.querySelector('#datetime-picker');
const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');

startBtn.disabled = true;

let userSelectedDate = null;

const options = {
    enableTime: true,
    time_24hr: true,
    allowInput: true,

    defaultDate: new Date(),
    minuteIncrement: 1,
    onClose(selectedDates) {
        const selected = selectedDates[0];
        if (!selected) return;

        if (selected <= new Date()) {
            userSelectedDate = null;

            iziToast.warning({
                title: 'Warning',
                message: 'Please choose a date in the future',
                position: 'topCenter',
            });
            startBtn.disabled = true;
            return;
        }
        userSelectedDate = selected;
        startBtn.disabled = false;
    },
};

flatpickr('#datetime-picker', options);

startBtn.addEventListener('click', () => {
    if (!userSelectedDate) {
        return;
    }

    startBtn.disabled = true;
    input.disabled = true;
    timer.start(userSelectedDate);
});

const timer = {
    intervalId: null,

    start(deadline) {
        this.stop();

        this.intervalId = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(deadline - now, 0);

            if (diff <= 0) {
                this.stop();
                updateTimer(convertMs(0));
                input.disabled = false;
                iziToast.success({
                    title: 'Finish',
                    message: 'The count is over',
                    position: 'topCenter',
                });
                return;
            }
            updateTimer(convertMs(diff));
        }, 1000);
    },
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
};

function updateTimer({ days, hours, minutes, seconds }) {
    daysEl.textContent = addLeadingZero(days);
    hoursEl.textContent = addLeadingZero(hours);
    minutesEl.textContent = addLeadingZero(minutes);
    secondsEl.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
    return String(value).padStart(2, '0');
}

function convertMs(ms) {
    // Number of milliseconds per unit of time
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    // Remaining days
    const days = Math.floor(ms / day);
    // Remaining hours
    const hours = Math.floor((ms % day) / hour);
    // Remaining minutes
    const minutes = Math.floor(((ms % day) % hour) / minute);
    // Remaining seconds
    const seconds = Math.floor((((ms % day) % hour) % minute) / second);

    return { days, hours, minutes, seconds };
}
