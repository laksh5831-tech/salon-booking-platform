const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const isTimeInRange = (time, start, end) => {
  const timeMins = timeToMinutes(time);
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  return timeMins >= startMins && timeMins < endMins;
};

const doTimesOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
};

const addMinutes = (time, minutes) => {
  const totalMinutes = timeToMinutes(time) + minutes;
  return minutesToTime(totalMinutes);
};

const generateTimeSlots = (startTime, endTime, duration, interval = 15) => {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + duration <= end) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration)
    });
    current += interval;
  }

  return slots;
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  isTimeInRange,
  doTimesOverlap,
  addMinutes,
  generateTimeSlots
};
