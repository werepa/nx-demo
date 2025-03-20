import { Entity } from './Entity';

class ConcreteEntity extends Entity<any> {
  constructor(props: any) {
    super(props);
  }
}

describe('Entity', () => {
  describe('constructor', () => {
    it('should set the id property if provided in the props object', () => {
      const props = { id: '123', name: 'John Doe' };
      const entity = new ConcreteEntity(props);
      expect(entity.id).toBe('123');
    });

    it('should generate a random id if no id is provided in the props object', () => {
      const props = { name: 'John Doe' };
      const entity = new ConcreteEntity(props);
      expect(entity.id).toBeDefined();
    });

    it('should add the id property to the props object', () => {
      const props = { name: 'John Doe' };
      const entity = new ConcreteEntity(props);
      expect(entity.id).toBeDefined();
    });
  });

  describe('id', () => {
    it('should return the value of the id property', () => {
      const props = { id: '123', name: 'John Doe' };
      const entity = new ConcreteEntity(props);
      expect(entity.id).toBe('123');
    });
  });
});
