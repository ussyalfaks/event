        let events = JSON.parse(localStorage.getItem('events')) || [];
        let categories = JSON.parse(localStorage.getItem('categories')) || ['Personal', 'Work', 'Holiday'];
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let editingEventId = null;

        function showLoading() {
            document.getElementById('loading').classList.remove('hidden');
        }

        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }

        function updateCurrentDate() {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const currentDate = new Date().toLocaleDateString('en-US', options);
            document.getElementById('currentDate').textContent = currentDate;
        }

        function renderCalendar() {
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date();

            let calendarHTML = `
                <div class="flex justify-between items-center mb-4">
                    <button id="prevMonth" class="text-gray-600 hover:text-gray-800 focus:outline-none">&lt;</button>
                    <h2 class="text-lg font-semibold">${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button id="nextMonth" class="text-gray-600 hover:text-gray-800 focus:outline-none">&gt;</button>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center">
                    <div class="text-gray-500 font-medium">S</div>
                    <div class="text-gray-500 font-medium">M</div>
                    <div class="text-gray-500 font-medium">T</div>
                    <div class="text-gray-500 font-medium">W</div>
                    <div class="text-gray-500 font-medium">T</div>
                    <div class="text-gray-500 font-medium">F</div>
                    <div class="text-gray-500 font-medium">S</div>
            `;

            for (let i = 0; i < firstDay; i++) {
                calendarHTML += '<div></div>';
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                calendarHTML += `
                    <div class="calendar-day flex items-center justify-center ${isToday ? 'text-indigo-600 ' : 'text-gray-700'} rounded-full cursor-pointer transition-all">
                        ${day}
                    </div>
                `;
            }

            calendarHTML += '</div>';
            document.getElementById('calendar').innerHTML = calendarHTML;

            document.getElementById('prevMonth').addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendar();
            });

            document.getElementById('nextMonth').addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendar();
            });
        }

        function renderEvents() {
            const eventList = document.getElementById('eventList');
            eventList.innerHTML = '';

            events.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.className = 'bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-all';
                eventCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">${event.name}</h3>
                            <p class="text-gray-600 mb-1">Date: ${new Date(event.date).toLocaleDateString()}</p>
                            <p class="text-gray-600 mb-2">Category: ${event.category}</p>
                            <p class="text-indigo-600 font-medium">Countdown: ${getCountdown(event.date)}</p>
                        </div>
                        <div class="space-x-2">
                            <button onclick="editEvent(${event.id})" class="text-yellow-500 hover:text-yellow-600 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <button onclick="deleteEvent(${event.id})" class="text-red-500 hover:text-red-600 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                eventList.appendChild(eventCard);
            });
        }

        function getCountdown(eventDate) {
            const now = new Date();
            const event = new Date(eventDate);
            const diff = event - now;

            if (diff < 0) {
                return 'Event has passed';
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            return `${days} days, ${hours} hours, ${minutes} minutes`;
        }

        function addEvent() {
            const name = document.getElementById('eventName').value;
            const date = document.getElementById('eventDate').value;
            const category = document.getElementById('eventCategory').value;

            if (name && date && category) {
                if (editingEventId) {
                    // Edit existing event
                    const eventIndex = events.findIndex(e => e.id === editingEventId);
                    if (eventIndex !== -1) {
                        events[eventIndex] = { ...events[eventIndex], name, date, category };
                    }
                    editingEventId = null;
                } else {
                    // Add new event
                    const newEvent = {
                        id: Date.now(),
                        name: name,
                        date: date,
                        category: category
                    };
                    events.push(newEvent);
                }
                saveEvents();
                renderEvents();
                closeEventModal();
            }
        }

        function editEvent(id) {
            const event = events.find(e => e.id === id);
            if (event) {
                editingEventId = id;
                document.getElementById('eventName').value = event.name;
                document.getElementById('eventDate').value = event.date;
                document.getElementById('eventCategory').value = event.category;
                document.getElementById('eventModalTitle').textContent = 'Edit Event';
                openEventModal();
            }
        }

        function deleteEvent(id) {
            events = events.filter(event => event.id !== id);
            saveEvents();
            renderEvents();
        }

        function addCategory() {
            const newCategory = document.getElementById('newCategory').value;
            if (newCategory && !categories.includes(newCategory)) {
                categories.push(newCategory);
                saveCategories();
                updateCategorySelect();
                document.getElementById('newCategory').value = '';
                closeCategoryModal();
            }
        }

        function updateCategorySelect() {
            const select = document.getElementById('eventCategory');
            select.innerHTML = categories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('');
        }

        function saveEvents() {
            localStorage.setItem('events', JSON.stringify(events));
        }

        function saveCategories() {
            localStorage.setItem('categories', JSON.stringify(categories));
        }

        function openEventModal() {
            document.getElementById('eventModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeEventModal() {
            document.getElementById('eventModal').classList.add('hidden');
            document.getElementById('eventName').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventCategory').value = '';
            document.getElementById('eventModalTitle').textContent = 'Add New Event';
            editingEventId = null;
            document.body.style.overflow = 'auto';
        }

        function openCategoryModal() {
            document.getElementById('categoryModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeCategoryModal() {
            document.getElementById('categoryModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        // Event Listeners
        document.getElementById('addEventBtn').addEventListener('click', openEventModal);
        document.getElementById('addCategoryBtn').addEventListener('click', openCategoryModal);
        document.getElementById('saveEventBtn').addEventListener('click', addEvent);
        document.getElementById('saveCategoryBtn').addEventListener('click', addCategory);
        document.getElementById('closeEventModalBtn').addEventListener('click', closeEventModal);
        document.getElementById('closeCategoryModalBtn').addEventListener('click', closeCategoryModal);

        // Initialize
        showLoading();
        setTimeout(() => {
            hideLoading();
            updateCurrentDate();
            renderCalendar();
            renderEvents();
            updateCategorySelect();
        }, 2000);

        // Update countdown every minute
        setInterval(renderEvents, 60000);

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target == document.getElementById('eventModal')) {
                closeEventModal();
            }
            if (event.target == document.getElementById('categoryModal')) {
                closeCategoryModal();
            }
        }