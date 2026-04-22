export interface GlossaryEntry {
  term: string;
  short: string;
  aliases?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "TM30", short: "Регистрация иностранца по адресу проживания — обязательна в течение 24 часов." },
  { term: "TM7", short: "Заявление на продление пребывания в Таиланде." },
  { term: "TM47", short: "90-day report — отчёт о месте проживания каждые 90 дней." },
  { term: "DTV", short: "Destination Thailand Visa — 5-летняя мультивиза для удалёнщиков, с 2024." },
  { term: "Non-B", short: "Бизнес-виза, обычно на год, привязана к работодателю.", aliases: ["Non B", "non-b"] },
  { term: "Non-O", short: "Семейная, пенсионная или для волонтёров — долгосрочная.", aliases: ["Non O", "non-o"] },
  { term: "LTR", short: "Long-Term Resident — 10-летняя виза от BOI." },
  { term: "ED-виза", short: "Студенческая виза, для учёбы в тайской школе или университете.", aliases: ["ED виза"] },
  { term: "иммиграшка", short: "Иммиграционный офис. В Бангкоке — Immigration Division 1." },
  { term: "визаран", short: "Короткий выезд из Таиланда ради нового въездного штампа.", aliases: ["виза-ран"] },
  { term: "бордер-ран", short: "Визаран через сухопутную границу (Лаос, Камбоджа, Мьянма)." },
  { term: "оверстей", short: "Превышение разрешённого срока пребывания. Штраф 500 бат/день, макс 20 000.", aliases: ["overstay"] },
  { term: "фаранг", short: "Разговорное обозначение иностранца, преимущественно европейской внешности." },
  { term: "BTS", short: "Skytrain — надземное метро Бангкока." },
  { term: "MRT", short: "Подземное метро Бангкока. Не путать с МРТ-сканом." },
  { term: "Чанвата", short: "Chaeng Wattana Government Complex — адрес Immigration Division 1.", aliases: ["Chaeng Wattana"] },
  { term: "Сукхумвит", short: "Главная улица Бангкока, вдоль неё центральные районы.", aliases: ["Sukhumvit"] },
  { term: "Экхамай", short: "Район на Сукхумвите, BTS Ekkamai — экспат-узел.", aliases: ["Ekkamai"] },
  { term: "Каосан", short: "Khao San Road — туристический бэкпекерский район.", aliases: ["Khao San"] },
  { term: "Суварна", short: "Суварнабхуми (BKK) — главный международный аэропорт Бангкока.", aliases: ["Суварнабхуми", "Suvarnabhumi"] },
  { term: "Дон Мыанг", short: "Второй аэропорт Бангкока, в основном лоукостеры.", aliases: ["Don Mueang", "DMK"] },
  { term: "TDAC", short: "Thailand Digital Arrival Card — онлайн-форма прибытия, обязательна с мая 2025." },
  { term: "SuperRich", short: "Сеть обменников в Бангкоке, лучшие курсы. Orange 1965 и зелёный Thailand — разные юрлица." },
  { term: "P2P", short: "Peer-to-peer обмен крипты на баты через биржи. Рискует блокировкой счёта тайским банком." },
  { term: "TIN", short: "Tax Identification Number — тайский ИНН для налоговой декларации." },
];
