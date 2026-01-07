import cron from "node-cron";
import { prisma } from "../db.js";
import { getNowDate } from "../utils/time.js";

//actualizeaza statusul even automat
export function startStatusScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = await getNowDate();

      //doar even aflate in modul AUTO
      const events = await prisma.event.findMany({
        where: { statusManual: false },
        select: { id: true, startTime: true, endTime: true, status: true },
      });

      const updates = [];
      for (const e of events) {
        //even trebuie sa fie OPEN in intervalul start - final
        const shouldOpen = now >= e.startTime && now <= e.endTime;
        const newStatus = shouldOpen ? "OPEN" : "CLOSED";

        //actualizam doar daca s a schimbat statusul
        if (newStatus !== e.status) {
          updates.push(prisma.event.update({ where: { id: e.id }, data: { status: newStatus } }));
        }
      }

      //aplicam update urile
      if (updates.length) await Promise.all(updates);
    } catch (err) {
      console.warn("Scheduler warning:", err?.message || err);
    }
  });
}
