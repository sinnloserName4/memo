package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;
import memo.model.Event;

/**
 * Entity implementation class for Entity: Size
 *
 */
@Entity
@Table(name = "SIZES")

public class Size implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(cascade = { CascadeType.REFRESH })
	@JoinColumn(name = "EVENT_ID")
	private Event event;
	private String name;

	@Column(name = "STOCK")
	private Integer NumInStock;

	@ManyToOne(cascade = {CascadeType.REFRESH})
    @JoinColumn(name = "COLOR_ID")
	private Color color;

	private static final long serialVersionUID = 1L;

	public Size() {
		super();
	}

	public Size(Event event, String name, Integer NumInStock, Color color)
    {
        this.event = event;
        this.name = name;
        this.NumInStock = NumInStock;
        this.color = color;
    }

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Event getEvent() {
		return this.event;
	}

	public void setEvent(Event event) {
		this.event = event;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getNumInStock() {
		return this.NumInStock;
	}

	public void setNumInStock(Integer NumInStock) {
		this.NumInStock = NumInStock;
	}

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    @Override
    public String toString() {
        return "Size{" +
                "id=" + id +
                ", event=" + event +
                ", name='" + name + '\'' +
                ", NumInStock=" + NumInStock +
                ", color=" + color +
                '}';
    }
}
