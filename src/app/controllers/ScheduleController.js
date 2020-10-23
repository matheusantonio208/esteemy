import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!isProvider) {
      return res.status(400).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(parsedDate).toUTCString(),
            endOfDay(parsedDate).toUTCString(),
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
        ],
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
