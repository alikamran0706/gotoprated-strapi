// src/api/openai/controllers/openai.js

const BASE_URL = process.env.FRONTEND_URL || 'https://flykaaba.com';

module.exports = {
    generateSessionId() {
        return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    },

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    async shouldSendWelcome(sessionId) {
        try {
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            if (!chat) return true;
            return !chat.last_welcome_date || chat.last_welcome_date !== this.getTodayDate();
        } catch (e) {
            strapi.log.error('shouldSendWelcome error:', e);
            return true;
        }
    },

    async updateWelcomeDate(sessionId) {
        try {
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            if (!chat) return;
            await strapi.db.query('api::chat.chat').update({
                where: { id: chat.id },
                data: { last_welcome_date: this.getTodayDate() }
            });
        } catch (e) {
            // last_welcome_date field may not exist — not critical, skip
            strapi.log.warn('updateWelcomeDate skipped (field may not exist):', e.message);
        }
    },

    // ─── GET OR CREATE CHAT ───────────────────────────────────────────────────────
    async getOrCreateChat(sessionId, userName, userEmail) {
        try {
            let chat = await strapi.db.query('api::chat.chat').findOne({
                where: { sessionId },
                populate: ['messages']
            });

            if (!chat) {
                strapi.log.info(`Creating new chat | sessionId: ${sessionId}`);

                const chatData = {
                    sessionId,
                    full_name: userName || null,
                    email: userEmail || null,
                    isGuest: true,
                    chat_status: 'active',
                    lastMessageAt: new Date(),
                };

                // Try with publishedAt first (Draft & Publish ON), then without
                try {
                    chat = await strapi.db.query('api::chat.chat').create({
                        data: { ...chatData, publishedAt: new Date() }
                    });
                } catch (e) {
                    strapi.log.warn('Chat create with publishedAt failed, retrying without:', e.message);
                    chat = await strapi.db.query('api::chat.chat').create({ data: chatData });
                }

                strapi.log.info(`Chat created | id: ${chat.id}`);
            }

            return chat;
        } catch (error) {
            strapi.log.error('getOrCreateChat error:', error);
            throw error;
        }
    },

    // ─── SAVE MESSAGE ─────────────────────────────────────────────────────────────
    async saveMessage(data) {
        try {
            const chat = await strapi.db.query('api::chat.chat').findOne({
                where: { sessionId: data.sessionId }
            });

            if (!chat) {
                strapi.log.error(`saveMessage: no chat found for sessionId ${data.sessionId}`);
                return null;
            }

            const isValid = data.role === 'user' ? (data.content?.length || 0) > 5 : true;

            // ✅ Strapi v4 correct relation syntax
            const messageData = {
                sessionId: data.sessionId,
                role: data.role,
                content: data.content,
                isValid,
                chat: { connect: [{ id: chat.id }] },
            };

            let message;
            try {
                // Try with publishedAt (Draft & Publish ON)
                message = await strapi.db.query('api::message.message').create({
                    data: { ...messageData, publishedAt: new Date() }
                });
            } catch (e) {
                strapi.log.warn('Message create with publishedAt failed, retrying without:', e.message);
                message = await strapi.db.query('api::message.message').create({ data: messageData });
            }

            strapi.log.info(`Message saved | id: ${message.id} | role: ${data.role} | session: ${data.sessionId}`);

            // Update chat metadata
            await strapi.db.query('api::chat.chat').update({
                where: { id: chat.id },
                data: {
                    lastMessageAt: new Date(),
                    ...(data.userName && { full_name: data.userName }),
                    ...(data.userEmail && { email: data.userEmail }),
                }
            });

            return message;
        } catch (error) {
            strapi.log.error('saveMessage error:', error);
            return null;
        }
    },

    // ─── GET SESSION MESSAGES ─────────────────────────────────────────────────────
    async getSessionMessages(sessionId) {
        try {
            const messages = await strapi.db.query('api::message.message').findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
                limit: 100
            });
            strapi.log.info(`getSessionMessages | ${messages.length} messages | session: ${sessionId}`);
            return messages;
        } catch (error) {
            strapi.log.error('getSessionMessages error:', error);
            return [];
        }
    },

    // ─── AGENCIES ────────────────────────────────────────────────────────────────
    async getVerifiedAgencies(country = null, city = null) {
        try {
            const filters = { profile_status: 'Approved', verified_badge: true };
            if (country) filters.countries = { name: { $containsi: country } };
            if (city) filters.cities = { name: { $containsi: city } };

            const agencies = await strapi.db.query('api::profile.profile').findMany({
                where: filters,
                populate: ['countries', 'cities', 'packages'],
                limit: 20
            });

            return agencies.map(agency => ({
                id: agency.id,
                name: agency.agency_name,
                slug: agency.slug,
                phone: agency.phone,
                email: agency.email,
                website: agency.website_url,
                verifiedBadge: agency.verified_badge,
                packageCount: agency.packages?.length || 0,
                countries: agency.countries?.map(c => c.name) || [],
                cities: agency.cities?.map(c => c.name) || [],
                url: `${BASE_URL}/travel-agencies/${agency.slug}/`
            }));
        } catch (error) {
            strapi.log.error('getVerifiedAgencies error:', error);
            return [];
        }
    },

    // ─── PACKAGES ─────────────────────────────────────────────────────────────────
    async searchPackages(ctx) {
        const { category, country, city, minPrice, maxPrice, duration, starRating, limit } = ctx.query;
        const packages = await this.getPackagesFromDatabase({
            category: category || 'umrah', country, city,
            minPrice: minPrice ? parseInt(minPrice) : null,
            maxPrice: maxPrice ? parseInt(maxPrice) : null,
            duration: duration ? parseInt(duration) : null,
            starRating, limit: limit ? parseInt(limit) : 20
        });
        return ctx.send({ success: true, count: packages.length, packages });
    },

    async getPackage(ctx) {
        const { slug } = ctx.params;
        const pkg = await this.getPackageBySlug(slug);
        if (!pkg) return ctx.send({ success: false, error: 'Package not found' }, 404);
        return ctx.send({ success: true, package: pkg });
    },

    async getPackagesFromDatabase(filters = {}) {
        try {
            const where = { package_status: 'Verified', duration_days: { $gte: 1 } };
            if (filters.category) where.category = { slug: filters.category };
            if (filters.country) where.country = { name: { $containsi: filters.country } };
            if (filters.city) where.cities = { name: { $containsi: filters.city } };
            if (filters.duration) where.duration_days = filters.duration;
            if (filters.minPrice) where.price = { $gte: filters.minPrice };
            if (filters.maxPrice) where.price = { ...where.price, $lte: filters.maxPrice };
            if (filters.starRating) where.star_rating = { name: { $containsi: filters.starRating } };
            if (filters.comfortLevel) where.comfort_levels = { name: { $in: filters.comfortLevel } };

            const packages = await strapi.db.query('api::package.package').findMany({
                where,
                populate: ['agency', 'category', 'country', 'cities', 'star_rating', 'comfort_levels', 'makkah_hotel', 'madina_hotel', 'reviews'],
                limit: filters.limit || 20
            });

            return packages
                .filter(pkg =>
                    pkg.title?.length > 3 &&
                    !pkg.title?.includes('rrrr') &&
                    pkg.duration_days >= 5 &&
                    pkg.price >= 100 &&
                    pkg.agency?.agency_name?.length > 2
                )
                .map(pkg => ({
                    id: pkg.id,
                    title: pkg.title,
                    slug: pkg.slug,
                    description: pkg.short_description || pkg.description,
                    price: pkg.price,
                    currency: pkg.currency || 'USD',
                    duration: { days: pkg.duration_days, nights: pkg.duration_nights },
                    category: pkg.category?.name,
                    agency: {
                        name: pkg.agency?.agency_name,
                        slug: pkg.agency?.slug,
                        verified: pkg.agency?.verified_badge,
                        url: pkg.agency?.slug ? `${BASE_URL}/travel-agencies/${pkg.agency.slug}/` : null
                    },
                    starRating: pkg.star_rating?.name,
                    comfortLevel: pkg.comfort_levels?.map(c => c.name) || [],
                    makkahHotel: pkg.makkah_hotel?.name,
                    madinahHotel: pkg.madina_hotel?.name,
                    includesZiyarat: !!pkg.ziyarat_details,
                    reviewCount: pkg.reviews?.length || 0,
                    averageRating: pkg.reviews?.length
                        ? pkg.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / pkg.reviews.length
                        : 0,
                    url: pkg.slug ? `${BASE_URL}/umrah-packages/${pkg.slug}/` : null
                }));
        } catch (error) {
            strapi.log.error('getPackagesFromDatabase error:', error);
            return [];
        }
    },

    async getPackagesByDuration(durationDays) {
        const packages = await this.getPackagesFromDatabase({ duration: durationDays, limit: 10 });
        return packages.filter(pkg => pkg.duration.days === durationDays && pkg.price >= 100);
    },

    // ─── COUNTRIES ────────────────────────────────────────────────────────────────
    getSupportedCountries() {
        return [
            { name: 'USA',          slug: 'usa',          label: '🇺🇸 USA' },
            { name: 'Pakistan',     slug: 'pakistan',     label: '🇵🇰 Pakistan' },
            { name: 'India',        slug: 'india',        label: '🇮🇳 India' },
            { name: 'Saudi Arabia', slug: 'saudi-arabia', label: '🇸🇦 Saudi Arabia' },
            { name: 'Dubai',        slug: 'dubai',        label: '🇦🇪 Dubai / UAE' },
            { name: 'Canada',       slug: 'canada',       label: '🇨🇦 Canada' },
        ];
    },

    async getPackagesByCountry(countryName) {
        return this.getPackagesFromDatabase({ country: countryName, limit: 10 });
    },

    // ─── STATS ────────────────────────────────────────────────────────────────────
    async getAllChats(ctx) {
        const chats = await strapi.db.query('api::chat.chat').findMany({
            populate: ['messages', 'user'],
            orderBy: { lastMessageAt: 'desc' },
            limit: 100
        });
        const chatsWithStats = await Promise.all(chats.map(async chat => ({
            ...chat,
            stats: await this.getChatStats(chat.sessionId)
        })));
        return ctx.send({ chats: chatsWithStats });
    },

    async getChatById(ctx) {
        const { id } = ctx.params;
        const chat = await strapi.db.query('api::chat.chat').findOne({
            where: { id: parseInt(id) },
            populate: ['messages', 'user']
        });
        if (!chat) return ctx.send({ error: 'Chat not found' }, 404);
        const stats = await this.getChatStats(chat.sessionId);
        const lastUserMessage = chat.messages?.filter(m => m.role === 'user').pop();
        const suggestions = this.generateSuggestions(chat.messages || [], lastUserMessage, null, chat.full_name);
        return ctx.send({ chat, stats, suggestions });
    },

    async getChatStats(sessionId) {
        try {
            const messages = await strapi.db.query('api::message.message').findMany({ where: { sessionId } });
            const userMessages = messages.filter(m => m.role === 'user');
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            return {
                totalMessages: messages.length,
                userMessageCount: userMessages.length,
                assistantMessageCount: messages.filter(m => m.role === 'assistant').length,
                validMessageCount: userMessages.filter(m => m.isValid).length,
                totalCharacters: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0),
                chatStatus: chat?.chat_status || 'active',
                lastMessageAt: chat?.lastMessageAt || null
            };
        } catch (error) {
            strapi.log.error('getChatStats error:', error);
            return null;
        }
    },

    async getAvailableDurations() {
        try {
            const packages = await strapi.db.query('api::package.package').findMany({
                where: { category: { slug: 'umrah' }, package_status: 'Verified' },
                select: ['duration_days']
            });
            return [...new Set(packages.map(p => p.duration_days).filter(Boolean))].sort((a, b) => a - b);
        } catch { return [5, 7, 10, 14, 18, 20, 30]; }
    },

    async getAvailableComfortLevels() {
        try {
            const packages = await strapi.db.query('api::package.package').findMany({
                where: { category: { slug: 'umrah' }, package_status: 'Verified' },
                populate: ['comfort_levels']
            });
            const levels = new Set();
            packages.forEach(pkg => pkg.comfort_levels?.forEach(cl => levels.add(cl.name)));
            return Array.from(levels);
        } catch { return ['Economy', '3-star', '4-star', '5-star', 'Luxury', 'Premium', 'VIP']; }
    },

    async getHotelsFromPackages(city) {
        try {
            const packages = await strapi.db.query('api::package.package').findMany({
                where: { category: { slug: 'umrah' }, package_status: 'Verified' },
                populate: ['makkah_hotel', 'madina_hotel']
            });
            const hotels = new Set();
            packages.forEach(pkg => {
                if (city === 'makkah' && pkg.makkah_hotel?.name) hotels.add(pkg.makkah_hotel.name);
                if (city === 'madinah' && pkg.madina_hotel?.name) hotels.add(pkg.madina_hotel.name);
            });
            return Array.from(hotels);
        } catch { return []; }
    },

    async getPackageStats() {
        try {
            const packages = await strapi.db.query('api::package.package').findMany({
                where: { category: { slug: 'umrah' }, package_status: 'Verified' }
            });
            let minPrice = Infinity, maxPrice = 0;
            packages.forEach(pkg => {
                if (pkg.price) { minPrice = Math.min(minPrice, pkg.price); maxPrice = Math.max(maxPrice, pkg.price); }
            });
            return { totalPackages: packages.length, priceRange: { min: minPrice === Infinity ? 500 : minPrice, max: maxPrice || 8000 } };
        } catch { return null; }
    },

    // ─── FALLBACK RESPONSE ────────────────────────────────────────────────────────
    async getFallbackResponse(lastUserMessage, userName, durationDays = null) {
        const message = lastUserMessage?.content?.toLowerCase() || '';

        if (message.match(/7[\s-]day/) || durationDays === 7) {
            const pkgs = await this.getPackagesByDuration(7);
            if (pkgs.length > 0) {
                const list = pkgs.map(p => `• **[${p.title}](${p.url})** — $${p.price} — by [${p.agency.name}](${p.agency.url || '#'})`).join('\n');
                return `As-salamu alaykum ${userName || 'Guest'}! 🕋\n\nHere are our **7-day Umrah packages**:\n\n${list}\n\n👉 [View all Umrah packages](${BASE_URL}/umrah-packages/)\n\nWould you like to filter by budget, hotel rating, or departure city?`;
            }
            return `As-salamu alaykum ${userName || 'Guest'}! 🕋\n\nNo 7-day packages right now. Available: 5, 10, 14, 30 days. Which works for you?`;
        }

        const countries = this.getSupportedCountries();
        const matchedCountry = countries.find(c => message.includes(c.name.toLowerCase()) || message.includes(c.slug));
        if (matchedCountry) {
            const pkgs = await this.getPackagesByCountry(matchedCountry.name);
            if (pkgs.length > 0) {
                const list = pkgs.slice(0, 5).map(p => `**[${p.title}](${p.url})** — $${p.price} — ${p.duration.days} days — by [${p.agency.name}](${p.agency.url || '#'})`).join('\n');
                return `Here are Umrah packages from **${matchedCountry.label}**:\n\n${list}\n\n👉 [View all packages](${BASE_URL}/umrah-packages/)\n\nWould you like to filter by duration or budget?`;
            }
        }

        if (message.includes('agenc') || message.includes('operator')) {
            const agencies = await this.getVerifiedAgencies();
            if (agencies.length > 0) {
                const list = agencies.slice(0, 5).map(a => `• **[${a.name}](${a.url})** — ${a.packageCount} packages`).join('\n');
                return `Here are our verified travel agencies:\n\n${list}\n\n👉 [View all agencies](${BASE_URL}/travel-agencies/)\n\nWould you like packages from a specific country?`;
            }
        }

        if (message.includes('package') || message.includes('umrah')) {
            const pkgs = await this.getPackagesFromDatabase({ limit: 5 });
            if (pkgs.length > 0) {
                const list = pkgs.map(p => `• **[${p.title}](${p.url})** — $${p.price} — ${p.duration.days} days — by [${p.agency.name}](${p.agency.url || '#'})`).join('\n');
                return `Here are some popular Umrah packages:\n\n${list}\n\n👉 [View all packages](${BASE_URL}/umrah-packages/)\n\nTell me your preferred duration, budget, or hotel rating and I'll narrow it down!`;
            }
        }

        return `As-salamu alaykum ${userName || 'Guest'}! 👋\n\nI'm your FlyKaaba AI assistant. I can help with:\n• Umrah packages (5, 7, 10, 14, 30 days)\n• Hotels near Haram in Makkah & Madinah\n• Visa requirements\n• Ziyarat tours\n• Price comparisons\n\nWe serve pilgrims from 🇺🇸 USA, 🇵🇰 Pakistan, 🇮🇳 India, 🇸🇦 Saudi Arabia, 🇦🇪 Dubai & 🇨🇦 Canada.\n\nWhat would you like to know? 🕋`;
    },

    // ─── SUGGESTIONS ─────────────────────────────────────────────────────────────
    generateSuggestions(messages, lastUserMessage, lastAIResponse, userName) {
        const lastMessage = lastUserMessage?.content?.toLowerCase() || '';
        const aiResponse = lastAIResponse?.content?.toLowerCase() || '';
        const count = messages.length;

        if (count === 0) return ['✈️ 7-day Umrah packages', '🕌 Hotels near Haram', '📋 Visa requirements', '💰 Price information', '🎯 Best time for Umrah'];
        if (lastMessage.match(/7[\s-]day/) || aiResponse.includes('7-day')) return ['📅 Show 7-day packages', '💰 Budget $1000-2000', '🏨 5-star hotels', '📍 View details', '📞 Contact agency'];
        if (['pakistan', 'india', 'usa', 'canada', 'dubai', 'saudi'].some(c => lastMessage.includes(c))) return ['📅 5-day packages', '📅 7-day packages', '📅 14-day packages', '💰 Budget options', '🏨 5-star options'];
        if (lastMessage.includes('days') || aiResponse.includes('duration')) return ['📅 5-day', '📅 7-day', '📅 10-day', '📅 14-day', '📅 30-day'];
        if (lastMessage.includes('price') || lastMessage.includes('budget') || aiResponse.includes('budget')) return ['💰 Under $1000', '💰 $1000-2000', '💰 $2000-4000', '💰 $4000+', '📊 Compare prices'];
        if (lastMessage.includes('hotel') || aiResponse.includes('hotel')) return ['🏨 5-star hotels', '🏨 4-star hotels', '🏨 3-star hotels', '📍 Walking distance to Haram', '🍽️ Full board'];
        if (lastMessage.includes('agenc') || aiResponse.includes('agenc')) return ['🇵🇰 Pakistan agencies', '🇺🇸 USA agencies', '🇮🇳 India agencies', '📞 Contact agency', '⭐ Top rated'];
        if (count >= 3) return ['📞 Speak with agent', '📧 Get custom quote', 'ℹ️ Help me choose', '🕌 Umrah guide', '📅 Best time to go'];
        return ['✈️ Browse packages', '🕌 Compare hotels', '💰 Get prices', '📋 Visa info', '🎯 Help me choose'];
    },

    // ─── DYNAMIC CONTEXT ─────────────────────────────────────────────────────────
    async buildDynamicContext() {
        const [durations, comfortLevels, packageStats, makkahHotels, madinahHotels, agencies, recentPackages, sevenDayPackages] = await Promise.all([
            this.getAvailableDurations(),
            this.getAvailableComfortLevels(),
            this.getPackageStats(),
            this.getHotelsFromPackages('makkah'),
            this.getHotelsFromPackages('madinah'),
            this.getVerifiedAgencies(),
            this.getPackagesFromDatabase({ limit: 5 }),
            this.getPackagesByDuration(7)
        ]);

        return `
## FLYKAABA LIVE DATA

Departure Countries: ${this.getSupportedCountries().map(c => c.label).join(' | ')}
Durations: ${durations.join(', ')} days
Stats: ${packageStats?.totalPackages || 0} packages | $${packageStats?.priceRange?.min || 500}–$${packageStats?.priceRange?.max || 8000}

### 7-Day Packages:
${sevenDayPackages.map(p => `• [${p.title}](${p.url}) — $${p.price} — [${p.agency.name}](${p.agency.url || '#'})`).join('\n') || '• None'}

### Recent Packages:
${recentPackages.map(p => `• [${p.title}](${p.url}) — $${p.price} — ${p.duration.days}d — [${p.agency.name}](${p.agency.url || '#'})`).join('\n') || '• None'}

### Makkah Hotels: ${makkahHotels.slice(0, 8).join(', ') || 'None'}
### Madinah Hotels: ${madinahHotels.slice(0, 8).join(', ') || 'None'}

### Agencies:
${agencies.slice(0, 8).map(a => `• [${a.name}](${a.url}) — ${a.packageCount} pkgs`).join('\n') || '• None'}

URLs: Packages → ${BASE_URL}/umrah-packages/ | Agencies → ${BASE_URL}/travel-agencies/

RULES: Use [Title](URL) links always. Only use real data above. End with follow-up question. Max 300 words.`;
    },

    // ─── OPENAI CALL ──────────────────────────────────────────────────────────────
    async callOpenAI(messages, userName, dynamicContext, isFirstMessageOfDay) {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();

        if (lastUserMessage?.content?.toLowerCase().match(/7[\s-]day/)) return this.getFallbackResponse(lastUserMessage, userName, 7);

        const matchedCountry = this.getSupportedCountries().find(c =>
            lastUserMessage?.content?.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCountry) return this.getFallbackResponse(lastUserMessage, userName);
        if (!openaiApiKey) return this.getFallbackResponse(lastUserMessage, userName);

        const systemPrompt = `You are the FlyKaaba AI assistant — a warm, expert Hajj & Umrah travel guide.

${dynamicContext}

${isFirstMessageOfDay ? 'Start with: "As-salamu alaykum! Welcome to FlyKaaba 🕋"' : 'Do NOT repeat welcome. Respond directly.'}

User name: ${userName || 'Guest'}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiApiKey}` },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
                    temperature: 0.7,
                    max_tokens: 600
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                strapi.log.error(`OpenAI ${response.status}:`, errText);
                throw new Error(`OpenAI ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || this.getFallbackResponse(lastUserMessage, userName);
        } catch (error) {
            strapi.log.error('callOpenAI error:', error);
            return this.getFallbackResponse(lastUserMessage, userName);
        }
    },

    // ─── MAIN CHAT ────────────────────────────────────────────────────────────────
    async chat(ctx) {
        try {
            const { messages, sessionId, userName, userEmail } = ctx.request.body;

            if (!messages || !Array.isArray(messages)) return ctx.badRequest('messages array is required');

            let currentSessionId = sessionId || this.generateSessionId();
            strapi.log.info(`chat() | session: ${currentSessionId} | user: ${userName}`);

            const chat = await this.getOrCreateChat(currentSessionId, userName, userEmail);

            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            if (lastUserMessage) {
                await this.saveMessage({
                    sessionId: currentSessionId,
                    role: 'user',
                    content: lastUserMessage.content,
                    userName: userName || chat.full_name,
                    userEmail: userEmail || chat.email
                });
            }

            const isFirstMessageOfDay = await this.shouldSendWelcome(currentSessionId);
            if (isFirstMessageOfDay) await this.updateWelcomeDate(currentSessionId);

            const [dynamicContext, chatHistory] = await Promise.all([
                this.buildDynamicContext(),
                this.getSessionMessages(currentSessionId)
            ]);

            const openaiMessages = chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content }));
            const aiResponse = await this.callOpenAI(openaiMessages, userName || chat.full_name, dynamicContext, isFirstMessageOfDay);

            await this.saveMessage({
                sessionId: currentSessionId,
                role: 'assistant',
                content: aiResponse,
                userName: userName || chat.full_name,
                userEmail: userEmail || chat.email
            });

            const suggestions = this.generateSuggestions(chatHistory, lastUserMessage, { content: aiResponse }, userName || chat.full_name);
            const stats = await this.getChatStats(currentSessionId);

            return ctx.send({ response: aiResponse, suggestions, sessionId: currentSessionId, stats, chatId: chat.id });
        } catch (error) {
            strapi.log.error('chat() fatal:', error);
            return ctx.internalServerError('Chat service error');
        }
    },

    async getChatHistory(ctx) {
        try {
            const { sessionId } = ctx.params;
            const messages = await this.getSessionMessages(sessionId);
            const stats = await this.getChatStats(sessionId);
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId }, populate: ['user'] });
            const lastUserMessage = messages.filter(m => m.role === 'user').pop();
            const lastAIResponse = messages.filter(m => m.role === 'assistant').pop();
            const suggestions = this.generateSuggestions(messages, lastUserMessage, lastAIResponse, chat?.full_name);
            return ctx.send({ messages, stats, chat, suggestions });
        } catch (error) {
            strapi.log.error('getChatHistory error:', error);
            return ctx.internalServerError('Could not fetch chat history');
        }
    },

    async updateUserInfo(ctx) {
        try {
            const { sessionId, full_name, email } = ctx.request.body;
            if (!sessionId) return ctx.badRequest('sessionId is required');

            await this.getOrCreateChat(sessionId, full_name, email);

            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            if (chat) {
                await strapi.db.query('api::chat.chat').update({
                    where: { id: chat.id },
                    data: { full_name, email, isGuest: true }
                });
            }

            const isFirstMessageOfDay = await this.shouldSendWelcome(sessionId);
            if (isFirstMessageOfDay) await this.updateWelcomeDate(sessionId);

            const countryList = this.getSupportedCountries().map(c => c.label).join(', ');
            const welcomeMessage = isFirstMessageOfDay
                ? `As-salamu alaykum **${full_name}**! Welcome to FlyKaaba 🕋\n\nI'm your personal AI assistant for Hajj & Umrah travel.\n\nI can help with:\n• Umrah packages (5, 7, 10, 14, 30 days)\n• Hotels near Haram\n• Visa requirements\n• Verified agencies\n• Ziyarat planning\n\nServing pilgrims from: ${countryList}\n\n**What would you like to know today?**`
                : `Welcome back **${full_name}**! 👋 How can I help with your Umrah or Hajj plans?`;

            await this.saveMessage({ sessionId, role: 'assistant', content: welcomeMessage, userName: full_name, userEmail: email });

            return ctx.send({
                success: true,
                welcomeMessage,
                suggestions: ['✈️ 7-day packages', '🕌 Hotels near Haram', '💰 Price info', '📋 Visa requirements', '🌍 Packages from my country']
            });
        } catch (error) {
            strapi.log.error('updateUserInfo error:', error);
            return ctx.internalServerError('Could not update user info');
        }
    },

    async deleteConversation(ctx) {
        try {
            const { sessionId } = ctx.params;
            await strapi.db.query('api::message.message').deleteMany({ where: { sessionId } });
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            if (chat) await strapi.db.query('api::chat.chat').update({ where: { id: chat.id }, data: { chat_status: 'deleted' } });
            return ctx.send({ success: true });
        } catch (error) {
            strapi.log.error('deleteConversation error:', error);
            return ctx.internalServerError('Could not delete conversation');
        }
    },

    async updateChatStatus(ctx) {
        try {
            const { sessionId, status } = ctx.request.body;
            const chat = await strapi.db.query('api::chat.chat').findOne({ where: { sessionId } });
            if (chat) await strapi.db.query('api::chat.chat').update({ where: { id: chat.id }, data: { chat_status: status } });
            return ctx.send({ success: true });
        } catch (error) {
            strapi.log.error('updateChatStatus error:', error);
            return ctx.internalServerError('Could not update status');
        }
    },
};