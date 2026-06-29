export const fakerOptions = [
  // Identifiers
  { label: "Random UUID", value: "{{$faker.string.uuid}}" },

  // Internet
  { label: "Random Email", value: "{{$faker.internet.email}}" },
  { label: "Random Password", value: "{{$faker.internet.password}}" },
  { label: "Random Domain", value: "{{$faker.internet.domainName}}" },
  { label: "Random URL", value: "{{$faker.internet.url}}" },
  { label: "Random IP Address", value: "{{$faker.internet.ip}}" },
  { label: "Random IPv6", value: "{{$faker.internet.ipv6}}" },
  { label: "Random User Agent", value: "{{$faker.internet.userAgent}}" },

  // Person
  { label: "Random First Name", value: "{{$faker.person.firstName}}" },
  { label: "Random Last Name", value: "{{$faker.person.lastName}}" },
  { label: "Random Full Name", value: "{{$faker.person.fullName}}" },
  { label: "Random Job Title", value: "{{$faker.person.jobTitle}}" },

  // Location
  { label: "Random Street Address", value: "{{$faker.location.streetAddress}}" },
  { label: "Random City", value: "{{$faker.location.city}}" },
  { label: "Random State", value: "{{$faker.location.state}}" },
  { label: "Random Country", value: "{{$faker.location.country}}" },
  { label: "Random Zip Code", value: "{{$faker.location.zipCode}}" },
  { label: "Random Latitude", value: "{{$faker.location.latitude}}" },
  { label: "Random Longitude", value: "{{$faker.location.longitude}}" },

  // Phone
  { label: "Random Phone Number", value: "{{$faker.phone.number}}" },

  // Company & Business
  { label: "Random Company Name", value: "{{$faker.company.name}}" },
  { label: "Random Catch Phrase", value: "{{$faker.company.catchPhrase}}" },
  { label: "Random BS", value: "{{$faker.company.bs}}" },

  // Commerce
  { label: "Random Product", value: "{{$faker.commerce.product}}" },
  { label: "Random Product Name", value: "{{$faker.commerce.productName}}" },
  { label: "Random Price", value: "{{$faker.commerce.price}}" },
  { label: "Random Department", value: "{{$faker.commerce.department}}" },
  { label: "Random Product Description", value: "{{$faker.commerce.productDescription}}" },

  // Date & Time
  { label: "Random Past Date", value: "{{$faker.date.past}}" },
  { label: "Random Future Date", value: "{{$faker.date.future}}" },
  { label: "Random Recent Date", value: "{{$faker.date.recent}}" },
  { label: "Random Birthdate", value: "{{$faker.date.birthdate}}" },

  // Number & String
  { label: "Random Number", value: "{{$faker.number.int}}" },
  { label: "Random Float", value: "{{$faker.number.float}}" },
  { label: "Random Hex", value: "{{$faker.string.hexadecimal}}" },
  { label: "Random Alphanumeric", value: "{{$faker.string.alphanumeric}}" },
  { label: "Random Emoji", value: "{{$faker.internet.emoji}}" },

  // System
  { label: "Random File Name", value: "{{$faker.system.fileName}}" },
  { label: "Random MIME Type", value: "{{$faker.system.mimeType}}" },
  { label: "Random File Type", value: "{{$faker.system.fileType}}" },

  // Finance
  { label: "Random Account Number", value: "{{$faker.finance.account}}" },
  { label: "Random Account Name", value: "{{$faker.finance.accountName}}" },
  { label: "Random Credit Card Number", value: "{{$faker.finance.creditCardNumber}}" },
  { label: "Random Currency Code", value: "{{$faker.finance.currencyCode}}" },
  { label: "Random IBAN", value: "{{$faker.finance.iban}}" },
  { label: "Random BIC", value: "{{$faker.finance.bic}}" },

  // Helpers
  { label: "Random Word", value: "{{$faker.word.sample}}" },
  { label: "Random Sentence", value: "{{$faker.lorem.sentence}}" },
  { label: "Random Paragraph", value: "{{$faker.lorem.paragraph}}" },
];