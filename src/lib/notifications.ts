import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Notification content pools ──────────────────────────────────────────────

export const MOTIVATION_NOTIFICATIONS = [
  { title: 'Rise & Grind 💪', body: "Your future self is watching. Make them proud today." },
  { title: 'Time to Move 🏋️', body: "The only workout you regret is the one you skipped." },
  { title: 'Consistency Wins 🔥', body: "Champions are made in the moments they want to quit." },
  { title: 'Show Up Today 🎯', body: "You don't have to be great to start, but you have to start to be great." },
  { title: 'Beast Mode On 💥', body: "Pain is temporary. Gains are forever. Let's go!" },
  { title: 'One More Rep 🏆', body: "Every rep you do today is a brick in the wall of your best self." },
  { title: 'No Excuses 🚀', body: "Motivation gets you started. Discipline keeps you going." },
  { title: 'Today Counts 🌟', body: "Small progress is still progress. You got this." },
  { title: 'Stronger Every Day 💪', body: "The iron never lies. Neither does consistency." },
  { title: 'Move Your Body 🏃', body: "Your body can handle it. Your mind just needs convincing." },
  { title: "Let's Go! 🔥", body: "Another day, another chance to be better than yesterday." },
  { title: 'Push Harder 💯', body: "Uncomfortable? Good. That's where growth lives." },
  { title: 'You vs You 🥊', body: "Stop competing with others. Compete with the person you were yesterday." },
  { title: 'Sweat It Out 💦', body: "Sweat is just fat crying. Make it cry today." },
  { title: 'Legendary Mode 🦁', body: "Legends aren't born. They're built in the gym, rep by rep." },
  { title: 'Keep Moving 🏅', body: "When you feel like stopping, remember why you started." },
  { title: 'Commit & Conquer 🎖️', body: "Commitment is showing up even when motivation has left the chat." },
  { title: 'Level Up 📈', body: "You're not just training your body — you're training your mind." },
  { title: 'It Starts Now ⏱️', body: "The best time to work out was yesterday. The second best time is right now." },
  { title: 'Earn It 💎', body: "Nobody remembers your rest days. They remember your results." },
];

export const QUIRKY_NOTIFICATIONS = [
  { title: 'Fun Fact 🧠', body: "Your muscles remember every workout you've ever done. They're literally keeping score." },
  { title: 'Plot Twist 😂', body: "Gym = therapy, but you get abs instead of a copay." },
  { title: 'Science Alert 🔬', body: "Lifting weights actually makes your bones denser. You're basically becoming human titanium." },
  { title: 'Hot Take 🌶️', body: "Skipping leg day is not a personality. Just saying." },
  { title: 'Did You Know? 🤔', body: "The human body has 600+ muscles. You probably skipped half of them." },
  { title: 'Nerd Alert 🤓', body: "Your heart pumps 2,000 gallons of blood daily. The least you can do is pump some iron." },
  { title: 'Awkward Truth 😬', body: "Your gym shoes have seen more action than most people's dating apps." },
  { title: 'Big Brain Gains 🧬', body: "Exercise literally grows new brain cells. You're not just getting jacked, you're getting smarter." },
  { title: 'Spicy Reminder 🌶️', body: "Rest day without active recovery is just called... napping." },
  { title: 'Plot Armor 🛡️', body: "Strong people are harder to kill. It's not vanity, it's survival strategy." },
  { title: 'Gym Wisdom 🎓', body: "The barbell doesn't care about your feelings, your age, or your excuses." },
  { title: 'Muscle Memory 🧠', body: "Once you build muscle, your body never truly forgets it. Gains have long memory." },
  { title: 'Fun Reality 😅', body: "Your muscles are literally tiny protein factories running 24/7 after a workout." },
  { title: 'Technically True 📊', body: "Every workout is technically also a social experiment: how weird are you willing to look?" },
  { title: 'Gym Math 🔢', body: "1 workout + consistency × time = transformation. The math is mathing." },
  { title: 'Existential Gains 🤯', body: "You are the result of 3.8 billion years of evolution. Go lift something heavy." },
  { title: 'Real Talk 😤', body: "Your muscles don't grow during the workout. They grow when you sleep & eat. You're welcome." },
  { title: 'Cursed Wisdom 😂', body: "You can't flex fat. Just a friendly reminder from your future self." },
  { title: 'Science Drops 🧪', body: "Exercise releases endorphins. Endorphins make you happy. Happy people don't skip leg day." },
  { title: 'Body Lore 🏛️', body: "Your glutes are the largest muscle in your body. Are you treating them with the respect they deserve?" },
];

export const DIET_NOTIFICATIONS = [
  { title: 'Eat to Win 🥗', body: "Abs are made in the kitchen. What did you eat today?" },
  { title: 'Protein Check 🥩', body: "Did you hit your protein goal today? Your muscles are waiting." },
  { title: 'Hydration Alert 💧', body: "Water: zero calories, infinite benefits. Drink up." },
  { title: 'Meal Time 🍽️', body: "Fueling your body right is just training you can't see." },
  { title: 'Macro Reality 📊', body: "Carbs aren't the enemy. Sedentary lifestyle is." },
  { title: 'Snack Smart 🥜', body: "Hunger + no plan = bad decisions. Prep your snacks!" },
  { title: 'Creatine PSA 💊', body: "Creatine is the most studied supplement ever. Still waiting on you to try it." },
  { title: 'Sugar Warning ⚠️', body: "That 'healthy' fruit juice might have more sugar than a soda. Read labels!" },
  { title: 'Pre-Workout Fuel ⚡', body: "A banana 30 minutes before training = free energy. Nature's pre-workout." },
  { title: 'Post-Workout Window 🕐', body: "Protein within 30-60 min post-workout. Your muscles are asking nicely." },
  { title: 'Calorie Math 🧮', body: "You can't out-train a bad diet. Trust the process AND the plate." },
  { title: 'Fiber Check 🥦', body: "Most people eat half the fiber they need. Your gut is not happy about this." },
  { title: 'Sleep + Nutrition 😴', body: "Poor sleep makes you crave junk food. Sleep is literally a diet hack." },
  { title: 'Whole Foods Win 🌾', body: "If your great-grandma wouldn't recognize it as food, maybe reconsider eating it." },
  { title: 'Omega-3 Reminder 🐟', body: "Fish oil reduces inflammation. Your joints will thank you on heavy squat days." },
  { title: 'Colourful Plate 🌈', body: "More colours on your plate = more micronutrients. Eat the rainbow." },
  { title: 'Mindful Eating 🧘', body: "Eating in front of screens makes you eat 25% more. Put the phone down." },
  { title: 'Recovery Nutrition 🔄', body: "Chocolate milk post-workout: the original recovery drink. Science agrees." },
  { title: 'Gut Health Drop 🦠', body: "A healthy gut microbiome improves energy, mood, and even gains. Eat fermented foods." },
  { title: 'Protein Sources 📋', body: "Eggs, chicken, Greek yogurt, lentils, cottage cheese — pick two for every meal." },
];

export const WORKOUT_REMINDERS = [
  { title: 'Workout Reminder ⏰', body: "You haven't logged a workout today. Your streak is watching you." },
  { title: 'Time to Train 🏋️', body: "Your muscles have been resting. Time to wake them up." },
  { title: 'Evening Grind 🌆', body: "Day's almost done — did you get your workout in?" },
  { title: 'Morning Session 🌅', body: "Start your day with movement. Everything else gets easier after." },
  { title: 'Quick Check-In 📱', body: "Even a 20-minute workout counts. Open the app and let's go." },
  { title: 'Habit Builder 🧱', body: "Missing one day is okay. Missing two in a row is how streaks die." },
  { title: 'Active Recovery 🚶', body: "No energy for lifting? A walk still counts. Move your body." },
  { title: 'Log That Workout 📝', body: "Did you train but forget to log? Open the app and record your progress." },
  { title: 'Stay Consistent 📅', body: "The secret to results: showing up even when you don't feel like it." },
  { title: '3-Day Streak? 🔥', body: "Keep the momentum. One workout away from locking in that habit." },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });
  }

  return true;
}

// ─── Cancel all scheduled notifications ──────────────────────────────────────

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Schedule all notification types ─────────────────────────────────────────

export async function scheduleAllNotifications(prefs: NotificationPrefs) {
  await cancelAllNotifications();

  if (!prefs.enabled) return;

  const now = new Date();

  // Morning motivation — 8:00 AM daily
  if (prefs.motivation) {
    await scheduleDailyNotification(
      randomFrom(MOTIVATION_NOTIFICATIONS),
      8, 0,
      'motivation-morning',
    );
    // Second motivation hit — 5:30 PM
    await scheduleDailyNotification(
      randomFrom(MOTIVATION_NOTIFICATIONS),
      17, 30,
      'motivation-evening',
    );
  }

  // Workout reminder — user-chosen hour, daily
  if (prefs.workoutReminder) {
    const [h, m] = prefs.reminderTime.split(':').map(Number);
    await scheduleDailyNotification(
      randomFrom(WORKOUT_REMINDERS),
      h, m,
      'workout-reminder',
    );
  }

  // Quirky fact — 12:15 PM daily
  if (prefs.quirkyFacts) {
    await scheduleDailyNotification(
      randomFrom(QUIRKY_NOTIFICATIONS),
      12, 15,
      'quirky-noon',
    );
  }

  // Diet tip — 7:00 PM daily
  if (prefs.dietTips) {
    await scheduleDailyNotification(
      randomFrom(DIET_NOTIFICATIONS),
      19, 0,
      'diet-evening',
    );
  }
}

async function scheduleDailyNotification(
  content: { title: string; body: string },
  hour: number,
  minute: number,
  identifier: string,
) {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// ─── Send an immediate test notification ─────────────────────────────────────

export async function sendTestNotification() {
  const categories = [
    MOTIVATION_NOTIFICATIONS,
    QUIRKY_NOTIFICATIONS,
    DIET_NOTIFICATIONS,
    WORKOUT_REMINDERS,
  ];
  const pool = randomFrom(categories);
  const msg = randomFrom(pool);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
    },
    trigger: null, // immediate
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  enabled: boolean;
  motivation: boolean;
  workoutReminder: boolean;
  quirkyFacts: boolean;
  dietTips: boolean;
  reminderTime: string; // "HH:MM" 24h
}
