import { WeekdayEnum } from '../../enum';
import { WeekdayList } from './WeekdayList';

describe('WeekdayList', () => {
  it('should create an instance of WeekdayList with valid properties', () => {
    const weekdays = [
      WeekdayEnum.SEGUNDA,
      WeekdayEnum.TERCA,
      WeekdayEnum.QUARTA,
    ];
    const weekdayList = WeekdayList.create(weekdays);

    expect(weekdayList).toBeInstanceOf(WeekdayList);
    expect(weekdayList.getItems()).toEqual(weekdays);
  });
});
