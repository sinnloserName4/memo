package memo.model;

import java.io.Serializable;
import java.lang.Integer;
import java.lang.String;
import javax.persistence.*;

/**
 * Entity implementation class for Entity: BankAcc
 *
 */
@Entity
@Table(name="BANK_ACCOUNTS")

@NamedQuery(name = "getBankAccById", query = "SELECT b FROM BankAcc b WHERE b.id = :id")
public class BankAcc implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(nullable= false)
	private String bankName;
	
	@Column(nullable= false)
	private String iban;
	
	@Column(nullable= false)
	private String bic;
	
	@Column(nullable= false)
	private String name;
	
	private static final long serialVersionUID = 1L;

	public BankAcc() {
		super();
	}   
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}   
	public String getBankName() {
		return this.bankName;
	}

	public void setBankName(String bankName) {
		this.bankName = bankName;
	}   
	public String getIban() {
		return this.iban;
	}

	public void setIban(String iban) {
		this.iban = iban;
	}   
	public String getBic() {
		return this.bic;
	}

	public void setBic(String bic) {
		this.bic = bic;
	}   
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}
   
}
