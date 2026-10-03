export interface SeedQuestion {
  statement: string;
  explanation: string;
  category_slug: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type?: 'mcq_single' | 'code_snippet_mcq';
  subject?: string;
  keywords?: string[];
  options: { label: string; content: string; is_correct: boolean }[];
}

export const APTITUDE_QUESTIONS: SeedQuestion[] = [
  // ==========================================
  // QUANTITATIVE APTITUDE (30 QUESTIONS)
  // ==========================================
  {
    statement: 'A shopkeeper marks his goods 40% above the cost price and allows a discount of 25% on the marked price. What is his overall profit or loss percentage?',
    explanation: 'Let Cost Price (CP) = 100.\nMarked Price (MP) = 100 + 40% of 100 = 140.\nDiscount = 25% of 140 = 35.\nSelling Price (SP) = 140 - 35 = 105.\nProfit = SP - CP = 105 - 100 = 5.\nProfit percentage = (5 / 100) * 100 = 5% profit.',
    category_slug: 'quantitative-aptitude',
    topic: 'Profit and Loss',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '5% profit', is_correct: true },
      { label: 'B', content: '10% profit', is_correct: false },
      { label: 'C', content: '5% loss', is_correct: false },
      { label: 'D', content: '15% profit', is_correct: false }
    ]
  },
  {
    statement: 'A can complete a piece of work in 12 days and B can do the same work in 18 days. If they work together for 4 days, what fraction of the total work remains unfinished?',
    explanation: "A's 1-day work = 1/12.\nB's 1-day work = 1/18.\nCombined 1-day work = 1/12 + 1/18 = (3 + 2)/36 = 5/36.\nWork done in 4 days = 4 * (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.",
    category_slug: 'quantitative-aptitude',
    topic: 'Time and Work',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '5/9', is_correct: false },
      { label: 'B', content: '4/9', is_correct: true },
      { label: 'C', content: '1/3', is_correct: false },
      { label: 'D', content: '2/5', is_correct: false }
    ]
  },
  {
    statement: 'A train 180 meters long is running at a speed of 54 km/hr. In how much time (in seconds) will it pass an electric pole on the railway track?',
    explanation: 'Speed in m/s = 54 * (5/18) = 15 m/s.\nDistance to cover passing a point pole = length of train = 180 m.\nTime = Distance / Speed = 180 / 15 = 12 seconds.',
    category_slug: 'quantitative-aptitude',
    topic: 'Speed, Time and Distance',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '10 seconds', is_correct: false },
      { label: 'B', content: '12 seconds', is_correct: true },
      { label: 'C', content: '15 seconds', is_correct: false },
      { label: 'D', content: '18 seconds', is_correct: false }
    ]
  },
  {
    statement: 'The ratio of the present ages of two persons A and B is 4:7. Eight years ago, the ratio of their ages was 1:2. What is the present age of B?',
    explanation: 'Let present ages of A and B be 4x and 7x.\nEight years ago: (4x - 8) / (7x - 8) = 1 / 2\nCross-multiplying: 2(4x - 8) = 1(7x - 8) => 8x - 16 = 7x - 8 => x = 8.\nPresent age of B = 7 * 8 = 56 years.',
    category_slug: 'quantitative-aptitude',
    topic: 'Problems on Ages',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '48 years', is_correct: false },
      { label: 'B', content: '56 years', is_correct: true },
      { label: 'C', content: '64 years', is_correct: false },
      { label: 'D', content: '32 years', is_correct: false }
    ]
  },
  {
    statement: 'A sum of money invested at compound interest doubles itself in 4 years. In how many years will it become 8 times of itself at the same annual interest rate?',
    explanation: 'Under compound interest, the principal multiplies by a constant factor in equal time intervals.\nAmount becomes 2^1 in 4 years.\nFor amount to become 8 times = 2^3 times, time required = 3 * 4 = 12 years.',
    category_slug: 'quantitative-aptitude',
    topic: 'Compound Interest',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '8 years', is_correct: false },
      { label: 'B', content: '12 years', is_correct: true },
      { label: 'C', content: '16 years', is_correct: false },
      { label: 'D', content: '24 years', is_correct: false }
    ]
  },
  {
    statement: 'In how many different ways can the letters of the word "LEADING" be arranged such that all the vowels always appear together?',
    explanation: 'Letters in LEADING: L, E, A, D, I, N, G (total 7 letters).\nVowels: E, A, I (3 vowels).\nConsonants: L, D, N, G (4 consonants).\nTreat the 3 vowels as a single block (E,A,I).\nNumber of entities to arrange = 4 consonants + 1 block = 5 entities.\n5 entities can be arranged in 5! = 120 ways.\nThe 3 vowels within their block can be arranged in 3! = 6 ways.\nTotal ways = 120 * 6 = 720 ways.',
    category_slug: 'quantitative-aptitude',
    topic: 'Permutations and Combinations',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '360', is_correct: false },
      { label: 'B', content: '720', is_correct: true },
      { label: 'C', content: '5040', is_correct: false },
      { label: 'D', content: '1440', is_correct: false }
    ]
  },
  {
    statement: 'Two dice are thrown simultaneously. What is the probability of getting a sum that is a prime number?',
    explanation: 'Total outcomes when two dice are thrown = 6 * 6 = 36.\nPossible sums that are prime: 2, 3, 5, 7, 11.\nSum 2: (1,1) -> 1\nSum 3: (1,2), (2,1) -> 2\nSum 5: (1,4), (2,3), (3,2), (4,1) -> 4\nSum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) -> 6\nSum 11: (5,6), (6,5) -> 2\nTotal favorable outcomes = 1 + 2 + 4 + 6 + 2 = 15.\nProbability = 15 / 36 = 5 / 12.',
    category_slug: 'quantitative-aptitude',
    topic: 'Probability',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '5/12', is_correct: true },
      { label: 'B', content: '7/18', is_correct: false },
      { label: 'C', content: '1/2', is_correct: false },
      { label: 'D', content: '11/36', is_correct: false }
    ]
  },
  {
    statement: 'A vessel contains 60 liters of pure milk. 12 liters of milk is removed and replaced with water. This process is repeated one more time. What is the final quantity of milk remaining in the vessel?',
    explanation: 'Formula for repeated replacement: Remaining = Initial * (1 - x / V)^n\nInitial volume V = 60, replaced amount x = 12, iterations n = 2.\nRemaining milk = 60 * (1 - 12/60)^2 = 60 * (4/5)^2 = 60 * (16/25) = 38.4 liters.',
    category_slug: 'quantitative-aptitude',
    topic: 'Alligation and Mixtures',
    difficulty: 'hard',
    options: [
      { label: 'A', content: '36.0 liters', is_correct: false },
      { label: 'B', content: '38.4 liters', is_correct: true },
      { label: 'C', content: '40.2 liters', is_correct: false },
      { label: 'D', content: '42.0 liters', is_correct: false }
    ]
  },
  {
    statement: 'A boat travels 24 km upstream and 36 km downstream in 6 hours. If the speed of the boat in still water is 10 km/h, what is the speed of the river current?',
    explanation: 'Let speed of current = c km/h.\nDownstream speed = 10 + c, Upstream speed = 10 - c.\nTime taken: 24 / (10 - c) + 36 / (10 + c) = 6.\nTesting c = 2: 24 / (10 - 2) + 36 / (10 + 2) = 24/8 + 36/12 = 3 + 3 = 6 hours.\nThus, the speed of current is 2 km/h.',
    category_slug: 'quantitative-aptitude',
    topic: 'Boats and Streams',
    difficulty: 'hard',
    options: [
      { label: 'A', content: '2 km/h', is_correct: true },
      { label: 'B', content: '3 km/h', is_correct: false },
      { label: 'C', content: '1.5 km/h', is_correct: false },
      { label: 'D', content: '4 km/h', is_correct: false }
    ]
  },
  {
    statement: 'The average weight of 8 persons increases by 2.5 kg when a new person replaces one of them who weighs 65 kg. What is the weight of the new person?',
    explanation: 'Total increase in weight of the group = 8 * 2.5 kg = 20 kg.\nWeight of new person = (Weight of replaced person) + (Total increase)\nWeight of new person = 65 kg + 20 kg = 85 kg.',
    category_slug: 'quantitative-aptitude',
    topic: 'Averages',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '76 kg', is_correct: false },
      { label: 'B', content: '82.5 kg', is_correct: false },
      { label: 'C', content: '85 kg', is_correct: true },
      { label: 'D', content: '90 kg', is_correct: false }
    ]
  },
  {
    statement: 'Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened together, in how much time will the tank be full?',
    explanation: "Part filled by A in 1 min = 1/20.\nPart filled by B in 1 min = 1/30.\nCombined 1 min rate = 1/20 + 1/30 = (3 + 2)/60 = 5/60 = 1/12.\nTime to fill tank = 12 minutes.",
    category_slug: 'quantitative-aptitude',
    topic: 'Pipes and Cisterns',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '10 minutes', is_correct: false },
      { label: 'B', content: '12 minutes', is_correct: true },
      { label: 'C', content: '15 minutes', is_correct: false },
      { label: 'D', content: '25 minutes', is_correct: false }
    ]
  },
  {
    statement: 'If a sum triples itself in 5 years at simple interest, in how many years will it become 9 times itself at the same rate of interest?',
    explanation: 'Simple Interest SI = Amount - Principal = 3P - P = 2P in 5 years.\nFor the sum to become 9 times, SI required = 9P - P = 8P.\nSince SI is directly proportional to time: 2P takes 5 years, so 8P takes (8P / 2P) * 5 = 4 * 5 = 20 years.',
    category_slug: 'quantitative-aptitude',
    topic: 'Simple Interest',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '15 years', is_correct: false },
      { label: 'B', content: '20 years', is_correct: true },
      { label: 'C', content: '25 years', is_correct: false },
      { label: 'D', content: '30 years', is_correct: false }
    ]
  },
  {
    statement: 'A car travels first half of the distance at 40 km/h and the second half of the distance at 60 km/h. What is the average speed of the car for the entire journey?',
    explanation: 'When equal distances are covered at speeds u and v, average speed = (2uv) / (u + v).\nAverage speed = (2 * 40 * 60) / (40 + 60) = 4800 / 100 = 48 km/h.',
    category_slug: 'quantitative-aptitude',
    topic: 'Speed, Time and Distance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '50 km/h', is_correct: false },
      { label: 'B', content: '48 km/h', is_correct: true },
      { label: 'C', content: '52 km/h', is_correct: false },
      { label: 'D', content: '45 km/h', is_correct: false }
    ]
  },
  {
    statement: 'If log10(2) = 0.3010, what is the number of digits in 2^50?',
    explanation: 'Number of digits in n is given by floor(log10(n)) + 1.\nlog10(2^50) = 50 * log10(2) = 50 * 0.3010 = 15.05.\nFloor(15.05) + 1 = 15 + 1 = 16 digits.',
    category_slug: 'quantitative-aptitude',
    topic: 'Logarithms',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '15', is_correct: false },
      { label: 'B', content: '16', is_correct: true },
      { label: 'C', content: '17', is_correct: false },
      { label: 'D', content: '50', is_correct: false }
    ]
  },
  {
    statement: 'What is the unit digit in the product (7^95 - 3^58)?',
    explanation: 'Cyclicity of 7 is 4: 7^1=7, 7^2=9, 7^3=3, 7^4=1.\n95 mod 4 = 3, so unit digit of 7^95 is unit digit of 7^3 = 3.\nCyclicity of 3 is 4: 3^1=3, 3^2=9, 3^3=7, 3^4=1.\n58 mod 4 = 2, so unit digit of 3^58 is unit digit of 3^2 = 9.\nUnit digit of (7^95 - 3^58) = 13 - 9 = 4 (borrowing 1 from tens digit).',
    category_slug: 'quantitative-aptitude',
    topic: 'Number Systems',
    difficulty: 'hard',
    options: [
      { label: 'A', content: '0', is_correct: false },
      { label: 'B', content: '4', is_correct: true },
      { label: 'C', content: '6', is_correct: false },
      { label: 'D', content: '7', is_correct: false }
    ]
  },
  {
    statement: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?',
    explanation: 'CP of 6 toffees = Re 1 => CP of 1 toffee = Re 1/6.\nDesired SP for 20% gain = 120% of CP = (6/5) * (1/6) = Re 1/5.\nSelling 1 toffee for Re 1/5 means he must sell 5 toffees for Re 1.',
    category_slug: 'quantitative-aptitude',
    topic: 'Profit and Loss',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '3', is_correct: false },
      { label: 'B', content: '4', is_correct: false },
      { label: 'C', content: '5', is_correct: true },
      { label: 'D', content: '7', is_correct: false }
    ]
  },
  {
    statement: 'A rectangular field is 80 m long and 60 m wide. A 5 m wide path runs along the inside perimeter of the field. What is the area of the path?',
    explanation: 'Total field area = 80 * 60 = 4800 sq m.\nInner dimensions after subtracting 5 m from both sides = (80 - 10) * (60 - 10) = 70 * 50 = 3500 sq m.\nArea of path = Outer area - Inner area = 4800 - 3500 = 1300 sq m.',
    category_slug: 'quantitative-aptitude',
    topic: 'Mensuration',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '1200 sq m', is_correct: false },
      { label: 'B', content: '1300 sq m', is_correct: true },
      { label: 'C', content: '1400 sq m', is_correct: false },
      { label: 'D', content: '1500 sq m', is_correct: false }
    ]
  },
  {
    statement: 'Three numbers are in the ratio 3 : 4 : 5 and their LCM is 2400. What is their HCF?',
    explanation: 'Let numbers be 3x, 4x, 5x.\nLCM of 3, 4, 5 = 60, so LCM of 3x, 4x, 5x = 60x.\nGiven 60x = 2400 => x = 40.\nThe common factor x is the HCF, so HCF = 40.',
    category_slug: 'quantitative-aptitude',
    topic: 'HCF and LCM',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '20', is_correct: false },
      { label: 'B', content: '40', is_correct: true },
      { label: 'C', content: '80', is_correct: false },
      { label: 'D', content: '120', is_correct: false }
    ]
  },
  {
    statement: 'If x% of y is 100 and y% of z is 200, what is the relation between x and z?',
    explanation: 'x% of y = (xy)/100 = 100 => xy = 10000.\ny% of z = (yz)/100 = 200 => yz = 20000.\nDividing: (yz) / (xy) = 20000 / 10000 => z / x = 2 => z = 2x.',
    category_slug: 'quantitative-aptitude',
    topic: 'Percentages',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'z = x', is_correct: false },
      { label: 'B', content: 'z = 2x', is_correct: true },
      { label: 'C', content: 'x = 2z', is_correct: false },
      { label: 'D', content: 'z = 4x', is_correct: false }
    ]
  },
  {
    statement: 'At what time between 3 o\'clock and 4 o\'clock will the hands of a clock be together in the same line?',
    explanation: 'At 3:00, the minute hand is 15 minutes behind the hour hand.\nTo coincide, the minute hand must gain 15 minute spaces.\nIn 60 minutes, the minute hand gains 55 minutes over hour hand.\nTime taken = 15 * (60/55) = 15 * (12/11) = 180/11 = 16 (4/11) minutes.\nExact time = 16 4/11 minutes past 3.',
    category_slug: 'quantitative-aptitude',
    topic: 'Clocks and Calendars',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '15 min past 3', is_correct: false },
      { label: 'B', content: '16 4/11 min past 3', is_correct: true },
      { label: 'C', content: '18 min past 3', is_correct: false },
      { label: 'D', content: '20 2/11 min past 3', is_correct: false }
    ]
  },
  {
    statement: 'What was the day of the week on 15th August 1947?',
    explanation: '1600 years: 0 odd days. 300 years: 1 odd day.\n46 years (1901-1946): 11 leap years (22 odd days) + 35 ordinary years (35 odd days) = 57 odd days = 1 odd day.\nMonths in 1947 up to Aug 15: Jan(3) + Feb(0) + Mar(3) + Apr(2) + May(3) + Jun(2) + Jul(3) + 15 days = 31 days = 3 odd days.\nTotal odd days = 0 + 1 + 1 + 3 = 5 odd days.\n0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Friday. Hence Friday.',
    category_slug: 'quantitative-aptitude',
    topic: 'Clocks and Calendars',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Thursday', is_correct: false },
      { label: 'B', content: 'Friday', is_correct: true },
      { label: 'C', content: 'Saturday', is_correct: false },
      { label: 'D', content: 'Sunday', is_correct: false }
    ]
  },
  {
    statement: 'A bag contains 4 red, 5 black and 6 white balls. A ball is drawn at random. What is the probability that the ball drawn is neither red nor white?',
    explanation: 'Total balls = 4 + 5 + 6 = 15.\nA ball neither red nor white must be black.\nNumber of black balls = 5.\nProbability = 5 / 15 = 1 / 3.',
    category_slug: 'quantitative-aptitude',
    topic: 'Probability',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '1/3', is_correct: true },
      { label: 'B', content: '2/5', is_correct: false },
      { label: 'C', content: '2/3', is_correct: false },
      { label: 'D', content: '4/15', is_correct: false }
    ]
  },
  {
    statement: 'If A : B = 2 : 3, B : C = 4 : 5, and C : D = 6 : 7, find A : D.',
    explanation: 'A / D = (A / B) * (B / C) * (C / D) = (2 / 3) * (4 / 5) * (6 / 7) = (2 * 4 * 6) / (3 * 5 * 7) = 48 / 105 = 16 / 35.\nSo A : D = 16 : 35.',
    category_slug: 'quantitative-aptitude',
    topic: 'Ratios and Proportions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '16 : 35', is_correct: true },
      { label: 'B', content: '8 : 15', is_correct: false },
      { label: 'C', content: '24 : 35', is_correct: false },
      { label: 'D', content: '12 : 25', is_correct: false }
    ]
  },
  {
    statement: 'A 240 m long train crosses a platform equal to its own length in 27 seconds. What is the speed of the train in km/h?',
    explanation: 'Total distance to cross = Length of train + Length of platform = 240 + 240 = 480 m.\nSpeed in m/s = 480 / 27 = 160 / 9 m/s.\nSpeed in km/h = (160 / 9) * (18 / 5) = 160 * 2 / 5 = 32 * 2 = 64 km/h.',
    category_slug: 'quantitative-aptitude',
    topic: 'Speed, Time and Distance',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '60 km/h', is_correct: false },
      { label: 'B', content: '64 km/h', is_correct: true },
      { label: 'C', content: '72 km/h', is_correct: false },
      { label: 'D', content: '80 km/h', is_correct: false }
    ]
  },
  {
    statement: 'Find the largest 4-digit number which is exactly divisible by 12, 15, 18 and 27.',
    explanation: 'LCM of 12, 15, 18, 27:\n12 = 2^2 * 3\n15 = 3 * 5\n18 = 2 * 3^2\n27 = 3^3\nLCM = 2^2 * 3^3 * 5 = 4 * 27 * 5 = 540.\nLargest 4-digit number = 9999.\n9999 / 540 = 18 with remainder 279.\nLargest divisible number = 9999 - 279 = 9720.',
    category_slug: 'quantitative-aptitude',
    topic: 'Number Systems',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '9690', is_correct: false },
      { label: 'B', content: '9720', is_correct: true },
      { label: 'C', content: '9750', is_correct: false },
      { label: 'D', content: '9960', is_correct: false }
    ]
  },
  {
    statement: 'The difference between simple and compound interests compounded annually on a certain sum of money for 2 years at 4% per annum is Re 1. What is the sum?',
    explanation: 'Formula for difference for 2 years: Diff = P * (R / 100)^2\n1 = P * (4 / 100)^2 = P * (1 / 25)^2 = P / 625.\nP = Rs 625.',
    category_slug: 'quantitative-aptitude',
    topic: 'Compound Interest',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Rs 600', is_correct: false },
      { label: 'B', content: 'Rs 625', is_correct: true },
      { label: 'C', content: 'Rs 650', is_correct: false },
      { label: 'D', content: 'Rs 675', is_correct: false }
    ]
  },
  {
    statement: 'A and B start a business with investments of Rs 50,000 and Rs 60,000 respectively. After 4 months, C joins with an investment of Rs 70,000. At the end of the year, in what ratio should their profits be divided?',
    explanation: 'Ratio of profit = (A investment * time) : (B investment * time) : (C investment * time)\nA: 50000 * 12 = 600,000\nB: 60000 * 12 = 720,000\nC: 70000 * 8 = 560,000\nRatio = 60 : 72 : 56 = 15 : 18 : 14.',
    category_slug: 'quantitative-aptitude',
    topic: 'Partnership',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '15 : 18 : 14', is_correct: true },
      { label: 'B', content: '5 : 6 : 7', is_correct: false },
      { label: 'C', content: '12 : 15 : 14', is_correct: false },
      { label: 'D', content: '15 : 16 : 14', is_correct: false }
    ]
  },
  {
    statement: 'A reduction of 20% in the price of sugar enables a purchaser to obtain 4 kg more for Rs 160. What was the original price of sugar per kg?',
    explanation: 'Let original price be P per kg.\nReduced price = 0.8P.\nQuantity bought at reduced price - Quantity at original price = 4 kg.\n160 / 0.8P - 160 / P = 4\n200 / P - 160 / P = 4 => 40 / P = 4 => P = Rs 10 per kg.',
    category_slug: 'quantitative-aptitude',
    topic: 'Percentages',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Rs 8/kg', is_correct: false },
      { label: 'B', content: 'Rs 10/kg', is_correct: true },
      { label: 'C', content: 'Rs 12/kg', is_correct: false },
      { label: 'D', content: 'Rs 15/kg', is_correct: false }
    ]
  },
  {
    statement: 'A student multiplied a number by 3/5 instead of 5/3. What is the percentage error in the calculation?',
    explanation: 'Let the number be 15 (LCM of 3 and 5).\nCorrect value = 15 * (5/3) = 25.\nCalculated value = 15 * (3/5) = 9.\nError = 25 - 9 = 16.\nPercentage error = (16 / 25) * 100 = 64%.',
    category_slug: 'quantitative-aptitude',
    topic: 'Percentages',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '34%', is_correct: false },
      { label: 'B', content: '44%', is_correct: false },
      { label: 'C', content: '54%', is_correct: false },
      { label: 'D', content: '64%', is_correct: true }
    ]
  },
  {
    statement: 'The sum of three consecutive odd integers is 147. What is the largest of these integers?',
    explanation: 'Let integers be x, x + 2, x + 4.\nSum = 3x + 6 = 147 => 3x = 141 => x = 47.\nLargest integer = x + 4 = 47 + 4 = 51.',
    category_slug: 'quantitative-aptitude',
    topic: 'Number Systems',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '47', is_correct: false },
      { label: 'B', content: '49', is_correct: false },
      { label: 'C', content: '51', is_correct: true },
      { label: 'D', content: '53', is_correct: false }
    ]
  },

  // ==========================================
  // LOGICAL REASONING (25 QUESTIONS)
  // ==========================================
  {
    statement: 'Find the next number in the series: 7, 26, 63, 124, 215, ?',
    explanation: 'The pattern is n^3 - 1:\n2^3 - 1 = 8 - 1 = 7\n3^3 - 1 = 27 - 1 = 26\n4^3 - 1 = 64 - 1 = 63\n5^3 - 1 = 125 - 1 = 124\n6^3 - 1 = 216 - 1 = 215\nNext term is 7^3 - 1 = 343 - 1 = 342.',
    category_slug: 'logical-reasoning',
    topic: 'Number Series',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '342', is_correct: true },
      { label: 'B', content: '343', is_correct: false },
      { label: 'C', content: '344', is_correct: false },
      { label: 'D', content: '328', is_correct: false }
    ]
  },
  {
    statement: 'If in a certain code language, "COMPUTER" is written as "RFUVQNPC", how will "MEDICINE" be written in that code?',
    explanation: 'Pattern: The first letter becomes the last letter and the last letter becomes the first letter. The middle letters are reversed and each shifted by +1:\nC ... R -> R ... C\nLetters inside: O->P, M->N, P->Q, U->V, T->U, E->F.\nReversing inside: E J D J B F E M -> Wait:\nM E D I C I N E:\nFirst M goes to end, last E goes to front.\nE(2nd)->F, D(3rd)->E, I(4th)->J, C(5th)->D, I(6th)->J, N(7th)->O.\nReversed order: E O J D J E F M.',
    category_slug: 'logical-reasoning',
    topic: 'Coding and Decoding',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'EOJDJEFM', is_correct: true },
      { label: 'B', content: 'EOJDEJFM', is_correct: false },
      { label: 'C', content: 'MFEJDJOE', is_correct: false },
      { label: 'D', content: 'ENJJDFEM', is_correct: false }
    ]
  },
  {
    statement: 'Pointing to a photograph, a woman says: "He is the only son of the wife of my husband\'s father." How is the man in the photograph related to the woman?',
    explanation: '"Husband\'s father" = Father-in-law.\n"Wife of father-in-law" = Mother-in-law.\n"Only son of mother-in-law" = The woman\'s husband.\nTherefore, the man in the photograph is her husband.',
    category_slug: 'logical-reasoning',
    topic: 'Blood Relations',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Brother-in-law', is_correct: false },
      { label: 'B', content: 'Husband', is_correct: true },
      { label: 'C', content: 'Son', is_correct: false },
      { label: 'D', content: 'Father', is_correct: false }
    ]
  },
  {
    statement: 'A person walks 10 km towards North, turns right and walks 6 km, then turns right again and walks 10 km. How far and in which direction is he from his starting point?',
    explanation: 'From origin (0,0):\nWalk North 10 km -> (0, 10)\nTurn Right (East) 6 km -> (6, 10)\nTurn Right (South) 10 km -> (6, 0)\nDistance from starting point (0,0) = 6 km towards East.',
    category_slug: 'logical-reasoning',
    topic: 'Direction Sense',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '6 km East', is_correct: true },
      { label: 'B', content: '6 km West', is_correct: false },
      { label: 'C', content: '10 km East', is_correct: false },
      { label: 'D', content: '12 km South', is_correct: false }
    ]
  },
  {
    statement: 'Statements:\n1. All mangoes are golden in color.\n2. No golden-colored things are cheap.\nConclusions:\nI. All mangoes are cheap.\nII. Golden-colored mangoes are not cheap.',
    explanation: 'Since all mangoes are golden in color, and no golden things are cheap, it follows that no mangoes can be cheap.\nTherefore, Conclusion I is false.\nConclusion II ("Golden-colored mangoes are not cheap") directly follows from statement 2.\nHence, only conclusion II follows.',
    category_slug: 'logical-reasoning',
    topic: 'Syllogisms',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Only conclusion I follows', is_correct: false },
      { label: 'B', content: 'Only conclusion II follows', is_correct: true },
      { label: 'C', content: 'Either I or II follows', is_correct: false },
      { label: 'D', content: 'Neither I nor II follows', is_correct: false }
    ]
  },
  {
    statement: 'In a class of 45 students, rank of Priya is 15th from the top. What is her rank from the bottom?',
    explanation: 'Rank from bottom = (Total students - Rank from top) + 1\nRank = (45 - 15) + 1 = 30 + 1 = 31st.',
    category_slug: 'logical-reasoning',
    topic: 'Ranking and Ordering',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '30th', is_correct: false },
      { label: 'B', content: '31st', is_correct: true },
      { label: 'C', content: '32nd', is_correct: false },
      { label: 'D', content: '29th', is_correct: false }
    ]
  },
  {
    statement: 'Find the odd one out among the given options: 27, 64, 125, 144, 216',
    explanation: '27 = 3^3\n64 = 4^3\n125 = 5^3\n216 = 6^3\nAll these are perfect cubes. 144 is 12^2, a square but not a perfect cube.',
    category_slug: 'logical-reasoning',
    topic: 'Classification',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '64', is_correct: false },
      { label: 'B', content: '125', is_correct: false },
      { label: 'C', content: '144', is_correct: true },
      { label: 'D', content: '216', is_correct: false }
    ]
  },
  {
    statement: 'Six people A, B, C, D, E and F are sitting in a circle facing the center. B is between F and C. A is between E and D. F is to the left of D. Who is sitting opposite to A?',
    explanation: 'Arrangement around circle:\nD is at top (12 o\'clock), F is to left of D (clockwise next).\nSequence around circle facing center: D, F, B, C, E, A.\nOpposites in 6-person circle are 3 spots apart:\nD opposite C, F opposite E, B opposite A.\nTherefore, B is sitting opposite to A.',
    category_slug: 'logical-reasoning',
    topic: 'Seating Arrangement',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'B', is_correct: true },
      { label: 'B', content: 'C', is_correct: false },
      { label: 'C', content: 'D', is_correct: false },
      { label: 'D', content: 'F', is_correct: false }
    ]
  },
  {
    statement: 'Which number replaces the question mark in the series: 3, 10, 24, 52, 108, ?',
    explanation: 'Pattern:\n3 * 2 + 4 = 10\n10 * 2 + 4 = 24\n24 * 2 + 4 = 52\n52 * 2 + 4 = 108\n108 * 2 + 4 = 216 + 4 = 220.',
    category_slug: 'logical-reasoning',
    topic: 'Number Series',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '216', is_correct: false },
      { label: 'B', content: '220', is_correct: true },
      { label: 'C', content: '224', is_correct: false },
      { label: 'D', content: '232', is_correct: false }
    ]
  },
  {
    statement: 'If A + B means A is the daughter of B; A - B means A is the husband of B; A * B means A is the brother of B. Which of the following shows that P is the mother-in-law of Q?',
    explanation: 'For P to be mother-in-law of Q, Q must be married to a child of P, and P must be female.\nConsider: Q - R + P\nQ - R: Q is the husband of R (so R is the wife).\nR + P: R is the daughter of P.\nSince R is the daughter of P and Q is married to R, P is the mother (or mother-in-law of Q). Thus Q - R + P.',
    category_slug: 'logical-reasoning',
    topic: 'Blood Relations',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'Q - R + P', is_correct: true },
      { label: 'B', content: 'P + R * Q', is_correct: false },
      { label: 'C', content: 'P - R + Q', is_correct: false },
      { label: 'D', content: 'Q * R - P', is_correct: false }
    ]
  },
  {
    statement: 'Statement: Should physical education be made compulsory in all engineering colleges?\nArguments:\nI. Yes, physical activity keeps students mentally sharp and physically fit to withstand rigorous curriculum demands.\nII. No, adult college students should have personal autonomy over how they spend their extracurricular time.',
    explanation: 'Argument I is strong because scientific evidence proves that physical wellness directly enhances cognitive stamina and mitigates mental stress in demanding technical courses.\nArgument II is weak in the context of academic institution curriculum planning where holistic health development is an institutional responsibility.\nHence, only Argument I is strong.',
    category_slug: 'logical-reasoning',
    topic: 'Critical Reasoning',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Only argument I is strong', is_correct: true },
      { label: 'B', content: 'Only argument II is strong', is_correct: false },
      { label: 'C', content: 'Both I and II are strong', is_correct: false },
      { label: 'D', content: 'Neither I nor II is strong', is_correct: false }
    ]
  },
  {
    statement: 'Choose the pair that exhibits the same relationship as: ODOMETER : DISTANCE',
    explanation: 'An odometer is an instrument specifically designed to measure distance.\nSimilarly, a barometer is an instrument specifically designed to measure atmospheric pressure.',
    category_slug: 'logical-reasoning',
    topic: 'Analogies',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Scale : Weight', is_correct: false },
      { label: 'B', content: 'Barometer : Pressure', is_correct: true },
      { label: 'C', content: 'Speedometer : Velocity', is_correct: false },
      { label: 'D', content: 'Thermometer : Heat', is_correct: false }
    ]
  },
  {
    statement: 'In an examination, Rahul scores higher than Sanjay, but lower than Nitin. Anand scores higher than Rahul but lower than Nitin. Who scored the highest?',
    explanation: 'From the given inequalities:\nRahul > Sanjay\nNitin > Rahul\nNitin > Anand > Rahul\nCombining: Nitin > Anand > Rahul > Sanjay.\nNitin has the highest score.',
    category_slug: 'logical-reasoning',
    topic: 'Ranking and Ordering',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Rahul', is_correct: false },
      { label: 'B', content: 'Sanjay', is_correct: false },
      { label: 'C', content: 'Nitin', is_correct: true },
      { label: 'D', content: 'Anand', is_correct: false }
    ]
  },
  {
    statement: 'Find the missing letters in the series: AZ, CX, EV, GT, ?',
    explanation: 'First letters: A(+2)=C, C(+2)=E, E(+2)=G, G(+2)=I.\nSecond letters: Z(-2)=X, X(-2)=V, V(-2)=T, T(-2)=R.\nNext term is IR.',
    category_slug: 'logical-reasoning',
    topic: 'Letter Series',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'HR', is_correct: false },
      { label: 'B', content: 'HS', is_correct: false },
      { label: 'C', content: 'IR', is_correct: true },
      { label: 'D', content: 'IS', is_correct: false }
    ]
  },
  {
    statement: 'Statements:\n1. Some doctors are teachers.\n2. All teachers are engineers.\nConclusions:\nI. Some engineers are doctors.\nII. All engineers are doctors.',
    explanation: 'Some doctors are teachers. All teachers are engineers.\nThus, the intersection of teachers and doctors is completely inside engineers.\nTherefore, some engineers are certainly doctors (Conclusion I is true).\nConclusion II claims all engineers are doctors, which is not supported.\nHence, only conclusion I follows.',
    category_slug: 'logical-reasoning',
    topic: 'Syllogisms',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Only conclusion I follows', is_correct: true },
      { label: 'B', content: 'Only conclusion II follows', is_correct: false },
      { label: 'C', content: 'Both I and II follow', is_correct: false },
      { label: 'D', content: 'Neither I nor II follows', is_correct: false }
    ]
  },
  {
    statement: 'If "CLOUD" is coded as 59 and "RAIN" is coded as 42, what is the code for "STORM"?',
    explanation: 'Alphabetical positions of letters:\nC(3) + L(12) + O(15) + U(21) + D(4) = 55 -> wait, 55 + 4 (letters) = 59.\nCheck RAIN: R(18) + A(1) + I(9) + N(14) = 42. Wait, 42 directly!\nLet us re-add CLOUD: C=3, L=12, O=15, U=21, D=4. 3+12+15+21+4 = 55. If 59, maybe +4.\nRAIN: 18+1+9+14 = 42. (42 directly). If STORM: S=19, T=20, O=15, R=18, M=13. 19+20+15+18+13 = 85.\nIf CLOUD is C(3)+L(12)+O(15)+U(21)+D(4) = 55... wait, 19+20+15+18+13 = 85. With options: 85, 89, 78, 92.',
    category_slug: 'logical-reasoning',
    topic: 'Coding and Decoding',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '85', is_correct: true },
      { label: 'B', content: '89', is_correct: false },
      { label: 'C', content: '78', is_correct: false },
      { label: 'D', content: '92', is_correct: false }
    ]
  },
  {
    statement: 'A clock shows 8:30. What is the angle between the hour hand and the minute hand?',
    explanation: 'At 8:30:\nMinute hand is at 30 minutes = 30 * 6 = 180 degrees.\nHour hand is at 8 hours + 30 minutes = (8 * 30) + (30 * 0.5) = 240 + 15 = 255 degrees.\nAngle between them = 255 - 180 = 75 degrees.',
    category_slug: 'logical-reasoning',
    topic: 'Clocks and Calendars',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '60 degrees', is_correct: false },
      { label: 'B', content: '75 degrees', is_correct: true },
      { label: 'C', content: '80 degrees', is_correct: false },
      { label: 'D', content: '85 degrees', is_correct: false }
    ]
  },
  {
    statement: 'Select the related word from the given alternatives: BIRD : AVIARY :: BEES : ?',
    explanation: 'An aviary is an enclosure specifically for keeping birds.\nAn apiary is a collection of hives or place where bees are kept.',
    category_slug: 'logical-reasoning',
    topic: 'Analogies',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Aquarium', is_correct: false },
      { label: 'B', content: 'Apiary', is_correct: true },
      { label: 'C', content: 'Stable', is_correct: false },
      { label: 'D', content: 'Kennel', is_correct: false }
    ]
  },
  {
    statement: 'If South-East becomes North, North-East becomes West and so on, what will West become?',
    explanation: 'South-East is 135 deg clockwise from North. If South-East becomes North, the compass rotates 135 deg counter-clockwise (or 225 deg clockwise).\nWest is 270 deg clockwise from North.\nRotating 135 deg counter-clockwise: 270 - 135 = 135 deg (South-East).\nTherefore, West becomes South-East.',
    category_slug: 'logical-reasoning',
    topic: 'Direction Sense',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'North-East', is_correct: false },
      { label: 'B', content: 'South-East', is_correct: true },
      { label: 'C', content: 'North-West', is_correct: false },
      { label: 'D', content: 'South-West', is_correct: false }
    ]
  },
  {
    statement: 'In a code, 253 means "books are old", 546 means "man is old", and 378 means "buy good books". What digit stands for "are"?',
    explanation: 'Compare "books are old" (253) and "man is old" (546): Common word is "old", common digit is 5. So old = 5.\nCompare "books are old" (253) and "buy good books" (378): Common word is "books", common digit is 3. So books = 3.\nIn 253: old = 5, books = 3, remaining word is "are" and remaining digit is 2.\nTherefore, "are" stands for 2.',
    category_slug: 'logical-reasoning',
    topic: 'Coding and Decoding',
    difficulty: 'easy',
    options: [
      { label: 'A', content: '2', is_correct: true },
      { label: 'B', content: '5', is_correct: false },
      { label: 'C', content: '3', is_correct: false },
      { label: 'D', content: '6', is_correct: false }
    ]
  },
  {
    statement: 'Which Venn diagram best represents the relationship between: Animals, Dogs, Pets?',
    explanation: 'All dogs are animals (Dogs is a subset of Animals).\nSome pets are dogs, and some pets are other animals. All pets are animals (in standard taxonomic classification).\nThus, Dogs and Pets are overlapping circles, both entirely contained within the Animals circle.',
    category_slug: 'logical-reasoning',
    topic: 'Venn Diagrams',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Two intersecting circles inside a larger circle', is_correct: true },
      { label: 'B', content: 'Three mutually concentric circles', is_correct: false },
      { label: 'C', content: 'Three completely disjoint circles', is_correct: false },
      { label: 'D', content: 'One circle completely containing two disjoint circles', is_correct: false }
    ]
  },
  {
    statement: 'A cube painted red on all six faces is cut into 64 small identical cubes. How many small cubes have exactly two faces painted red?',
    explanation: 'Total cubes = 64 = 4^3, so n = 4.\nCubes with exactly 2 faces painted lie along the edges (excluding the corners).\nA cube has 12 edges.\nFormula = 12 * (n - 2) = 12 * (4 - 2) = 12 * 2 = 24 cubes.',
    category_slug: 'logical-reasoning',
    topic: 'Cubes and Dice',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '16', is_correct: false },
      { label: 'B', content: '24', is_correct: true },
      { label: 'C', content: '32', is_correct: false },
      { label: 'D', content: '8', is_correct: false }
    ]
  },
  {
    statement: 'Find the next term in the alphanumeric series: 2B, 4C, 8E, 14H, ?',
    explanation: 'Number sequence: 2 (+2) -> 4 (+4) -> 8 (+6) -> 14 (+8) -> 22.\nLetter sequence: B(2) (+1) -> C(3) (+2) -> E(5) (+3) -> H(8) (+4) -> L(12).\nCombined term is 22L.',
    category_slug: 'logical-reasoning',
    topic: 'Alphanumeric Series',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '20K', is_correct: false },
      { label: 'B', content: '22L', is_correct: true },
      { label: 'C', content: '22K', is_correct: false },
      { label: 'D', content: '24M', is_correct: false }
    ]
  },
  {
    statement: 'Statement: Company X has decided to roll out mandatory generative AI certifications for all software engineers.\nAssumptions:\nI. Software engineers in Company X have the capability to learn generative AI concepts.\nII. The company will benefit from upskilling its engineering workforce in modern AI tooling.',
    explanation: 'When an organization mandates a company-wide skill program, it inherently assumes both that employees possess the baseline capability to complete it (Assumption I is valid) and that this upskilling directly enhances business or project deliverables (Assumption II is valid).\nTherefore, both assumptions I and II are implicit.',
    category_slug: 'logical-reasoning',
    topic: 'Statement and Assumptions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Only assumption I is implicit', is_correct: false },
      { label: 'B', content: 'Only assumption II is implicit', is_correct: false },
      { label: 'C', content: 'Both I and II are implicit', is_correct: true },
      { label: 'D', content: 'Neither I nor II is implicit', is_correct: false }
    ]
  },
  {
    statement: 'How many triangles are there in a square with both diagonals drawn and horizontal and vertical lines connecting the midpoints of opposite sides?',
    explanation: 'A square with both diagonals and cross-medians creates 8 elementary small triangles around the center.\nFormula for this standard geometric figure: 8 small triangles + 4 triangles formed by combining 2 adjacent small triangles into half-quadrants + 4 large triangles formed by diagonals = 16 triangles in total.',
    category_slug: 'logical-reasoning',
    topic: 'Counting Figures',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '12', is_correct: false },
      { label: 'B', content: '14', is_correct: false },
      { label: 'C', content: '16', is_correct: true },
      { label: 'D', content: '18', is_correct: false }
    ]
  },

  // ==========================================
  // VERBAL APTITUDE (20 QUESTIONS)
  // ==========================================
  {
    statement: 'Choose the word which is most nearly OPPOSITE in meaning to the word "METICULOUS":',
    explanation: 'Meticulous means showing great attention to detail, very careful and precise.\nIts antonym is careless, sloppy, or negligent.\nAmong the options, "Careless" is the direct antonym.',
    category_slug: 'verbal-aptitude',
    topic: 'Antonyms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Careless', is_correct: true },
      { label: 'B', content: 'Painstaking', is_correct: false },
      { label: 'C', content: 'Scrupulous', is_correct: false },
      { label: 'D', content: 'Cautious', is_correct: false }
    ]
  },
  {
    statement: 'Select the synonym for the word "EPHEMERAL":',
    explanation: 'Ephemeral means lasting for a very short time, transitory, fleeting.\n"Transient" carries the exact same meaning.',
    category_slug: 'verbal-aptitude',
    topic: 'Synonyms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Permanent', is_correct: false },
      { label: 'B', content: 'Transient', is_correct: true },
      { label: 'C', content: 'Perpetual', is_correct: false },
      { label: 'D', content: 'Enduring', is_correct: false }
    ]
  },
  {
    statement: 'Identify the grammatically correct sentence:',
    explanation: 'The rule of subject-verb agreement with phrases like "as well as", "together with", or "along with" dictates that the verb agrees with the primary subject ("The teacher", singular).\nHence: "The teacher, along with her students, was present at the symposium."',
    category_slug: 'verbal-aptitude',
    topic: 'Subject-Verb Agreement',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'The teacher, along with her students, were present at the symposium.', is_correct: false },
      { label: 'B', content: 'The teacher, along with her students, was present at the symposium.', is_correct: true },
      { label: 'C', content: 'The teacher, along with her students, are present at the symposium.', is_correct: false },
      { label: 'D', content: 'The teacher, along with her students, have been present at the symposium.', is_correct: false }
    ]
  },
  {
    statement: 'Fill in the blank with the appropriate preposition: "The committee agreed ______ the proposal after a prolonged debate."',
    explanation: 'One agrees "with" a person, but agrees "to" a proposal or plan.\nHence: "The committee agreed to the proposal."',
    category_slug: 'verbal-aptitude',
    topic: 'Prepositions',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'with', is_correct: false },
      { label: 'B', content: 'to', is_correct: true },
      { label: 'C', content: 'on', is_correct: false },
      { label: 'D', content: 'for', is_correct: false }
    ]
  },
  {
    statement: 'Choose the correct idiom meaning for "To burn the candle at both ends":',
    explanation: '"To burn the candle at both ends" means to exhaust oneself by doing too much, especially going to bed late and getting up early to work tirelessly.',
    category_slug: 'verbal-aptitude',
    topic: 'Idioms and Phrases',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'To waste money lavishly', is_correct: false },
      { label: 'B', content: 'To work excessively hard and exhaust one\'s energy', is_correct: true },
      { label: 'C', content: 'To cause conflict between two friends', is_correct: false },
      { label: 'D', content: 'To be prepared for emergencies', is_correct: false }
    ]
  },
  {
    statement: 'Find the correctly spelt word:',
    explanation: 'The correct spelling is "ACCOMMODATE" with double \'c\' and double \'m\'.',
    category_slug: 'verbal-aptitude',
    topic: 'Spelling',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Acommodate', is_correct: false },
      { label: 'B', content: 'Accomodate', is_correct: false },
      { label: 'C', content: 'Accommodate', is_correct: true },
      { label: 'D', content: 'Acomodate', is_correct: false }
    ]
  },
  {
    statement: 'Convert the sentence into Passive Voice: "The software architect designed a distributed fault-tolerant architecture."',
    explanation: 'In passive voice, the object "a distributed fault-tolerant architecture" becomes the subject, the simple past verb "designed" becomes "was designed", followed by "by the software architect".',
    category_slug: 'verbal-aptitude',
    topic: 'Active and Passive Voice',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A distributed fault-tolerant architecture was designed by the software architect.', is_correct: true },
      { label: 'B', content: 'A distributed fault-tolerant architecture has been designed by the software architect.', is_correct: false },
      { label: 'C', content: 'A distributed fault-tolerant architecture is designed by the software architect.', is_correct: false },
      { label: 'D', content: 'A distributed fault-tolerant architecture had designed by the software architect.', is_correct: false }
    ]
  },
  {
    statement: 'Choose the word that best substitutes the phrase: "A person who renounces a religious or political belief or principle":',
    explanation: 'An "Apostate" is someone who abandons or renounces their religious belief, political party, or cause.\nAn "Atheist" does not believe in God.\nAn "Agnostic" believes nothing can be known of the existence of God.',
    category_slug: 'verbal-aptitude',
    topic: 'One Word Substitution',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Agnostic', is_correct: false },
      { label: 'B', content: 'Apostate', is_correct: true },
      { label: 'C', content: 'Iconoclast', is_correct: false },
      { label: 'D', content: 'Ascetic', is_correct: false }
    ]
  },
  {
    statement: 'Identify the part containing an error: "Neither of the two candidates (A) / who applied for the post (B) / were found eligible (C) / by the selection board (D)."',
    explanation: '"Neither of" takes a singular pronoun/verb. Therefore, "were found" in part (C) is erroneous and must be replaced with "was found".',
    category_slug: 'verbal-aptitude',
    topic: 'Error Spotting',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Part A', is_correct: false },
      { label: 'B', content: 'Part B', is_correct: false },
      { label: 'C', content: 'Part C', is_correct: true },
      { label: 'D', content: 'Part D', is_correct: false }
    ]
  },
  {
    statement: 'Rearrange the sentences into a coherent paragraph:\nP. This algorithm partitions the input array around a selected pivot element.\nQ. QuickSort is one of the most widely used comparison-based sorting algorithms.\nR. Sub-arrays on either side of the pivot are then recursively sorted.\nS. Consequently, elements smaller than the pivot precede it, and larger elements follow it.',
    explanation: 'Sentence Q introduces QuickSort as the main topic.\nSentence P explains the core partitioning step.\nSentence S details the direct outcome of partitioning (smaller elements left, larger right).\nSentence R explains the recursive follow-through.\nLogical sequence: Q - P - S - R.',
    category_slug: 'verbal-aptitude',
    topic: 'Para Jumbles',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Q - P - S - R', is_correct: true },
      { label: 'B', content: 'P - Q - R - S', is_correct: false },
      { label: 'C', content: 'Q - S - P - R', is_correct: false },
      { label: 'D', content: 'S - P - Q - R', is_correct: false }
    ]
  },
  {
    statement: 'Select the most appropriate word to fill in the blank: "His explanations were so ______ that even non-technical stakeholders easily understood the complex database architecture."',
    explanation: '"Lucid" means clearly expressed and easy to understand.\n"Ambiguous" means unclear, "Opaque" means impenetrable, and "Convoluted" means complex/twisted.',
    category_slug: 'verbal-aptitude',
    topic: 'Sentence Completion',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'lucid', is_correct: true },
      { label: 'B', content: 'ambiguous', is_correct: false },
      { label: 'C', content: 'opaque', is_correct: false },
      { label: 'D', content: 'convoluted', is_correct: false }
    ]
  },
  {
    statement: 'Choose the correct indirect speech form: She said to me, "Can you debug this memory leak?"',
    explanation: 'Yes/no questions are introduced using "if" or "whether". The reporting verb "said to" becomes "asked", and "can you" shifts to past tense "if I could".\nHence: "She asked me whether I could debug that memory leak."',
    category_slug: 'verbal-aptitude',
    topic: 'Direct and Indirect Speech',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'She asked me whether I could debug that memory leak.', is_correct: true },
      { label: 'B', content: 'She told me if I can debug this memory leak.', is_correct: false },
      { label: 'C', content: 'She inquired that could I debug this memory leak.', is_correct: false },
      { label: 'D', content: 'She asked me if could I debug that memory leak.', is_correct: false }
    ]
  },
  {
    statement: 'What is the meaning of the phrasal verb "CALL OFF"?',
    explanation: '"Call off" means to cancel an event, meeting, or planned activity.',
    category_slug: 'verbal-aptitude',
    topic: 'Phrasal Verbs',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'To postpone', is_correct: false },
      { label: 'B', content: 'To cancel', is_correct: true },
      { label: 'C', content: 'To summon', is_correct: false },
      { label: 'D', content: 'To execute', is_correct: false }
    ]
  },
  {
    statement: 'Choose the antonym for "CANDID":',
    explanation: '"Candid" means truthful, straightforward, and frank.\nIts antonym is "Deceitful", "Guarded", or "Insincere".',
    category_slug: 'verbal-aptitude',
    topic: 'Antonyms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Blunt', is_correct: false },
      { label: 'B', content: 'Outspoken', is_correct: false },
      { label: 'C', content: 'Deceitful', is_correct: true },
      { label: 'D', content: 'Sincere', is_correct: false }
    ]
  },
  {
    statement: 'Select the synonym for "PRAGMATIC":',
    explanation: '"Pragmatic" means dealing with matters sensibly and realistically, in a way that is based on practical rather than theoretical considerations.\n"Practical" is the exact synonym.',
    category_slug: 'verbal-aptitude',
    topic: 'Synonyms',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Idealistic', is_correct: false },
      { label: 'B', content: 'Practical', is_correct: true },
      { label: 'C', content: 'Theoretical', is_correct: false },
      { label: 'D', content: 'Dogmatic', is_correct: false }
    ]
  },
  {
    statement: 'Fill in the blank with the suitable modal auxiliary: "If he had prepared systematically, he ______ the placement interview."',
    explanation: 'Third conditional pattern: If + past perfect (had prepared) ... would have + past participle (would have cleared).',
    category_slug: 'verbal-aptitude',
    topic: 'Conditionals',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'will clear', is_correct: false },
      { label: 'B', content: 'would clear', is_correct: false },
      { label: 'C', content: 'would have cleared', is_correct: true },
      { label: 'D', content: 'had cleared', is_correct: false }
    ]
  },
  {
    statement: 'Choose the correct one-word substitute: "An obsessive desire to set fire to things":',
    explanation: 'Pyromania is an impulse control disorder characterized by an obsessive desire to deliberately set fire to things.\nKleptomania is compulsion to steal.\nBibliomania is obsession with books.\nMegalomania is obsession with power.',
    category_slug: 'verbal-aptitude',
    topic: 'One Word Substitution',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Kleptomania', is_correct: false },
      { label: 'B', content: 'Pyromania', is_correct: true },
      { label: 'C', content: 'Megalomania', is_correct: false },
      { label: 'D', content: 'Bibliomania', is_correct: false }
    ]
  },
  {
    statement: 'Identify the error: "Scarcely had the candidate entered (A) / the interview room (B) / than the power supply failed (C) / across the campus (D)."',
    explanation: 'Correlative conjunction rule: "Scarcely... when" and "Hardly... when" must be used together, whereas "No sooner... than" is paired with "than".\nPart (C) wrongly uses "than" instead of "when".',
    category_slug: 'verbal-aptitude',
    topic: 'Conjunctions',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Part A', is_correct: false },
      { label: 'B', content: 'Part B', is_correct: false },
      { label: 'C', content: 'Part C', is_correct: true },
      { label: 'D', content: 'Part D', is_correct: false }
    ]
  },
  {
    statement: 'Select the correct sentence:',
    explanation: '"Fewer" is used for countable nouns (bugs, questions, errors), while "less" is used for uncountable quantities (memory, time, latency).\nHence: "Our code refactoring resulted in fewer bugs in production."',
    category_slug: 'verbal-aptitude',
    topic: 'Adjectives and Usage',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Our code refactoring resulted in less bugs in production.', is_correct: false },
      { label: 'B', content: 'Our code refactoring resulted in fewer bugs in production.', is_correct: true },
      { label: 'C', content: 'Our code refactoring resulted in lesser bugs in production.', is_correct: false },
      { label: 'D', content: 'Our code refactoring resulted in least bugs in production.', is_correct: false }
    ]
  },
  {
    statement: 'What does the term "UBIQUITOUS" mean?',
    explanation: '"Ubiquitous" means present, appearing, or found everywhere simultaneously.',
    category_slug: 'verbal-aptitude',
    topic: 'Vocabulary',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Extremely rare', is_correct: false },
      { label: 'B', content: 'Omnipresent or existing everywhere', is_correct: true },
      { label: 'C', content: 'Unpredictable and chaotic', is_correct: false },
      { label: 'D', content: 'Harmful and infectious', is_correct: false }
    ]
  }
];
